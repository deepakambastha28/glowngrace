import { neon } from "@neondatabase/serverless";
import { Pool } from "pg";
import { getLocalDbUrl, isLocalMode } from "@/lib/db";

/**
 * Neon → local Docker database sync.
 *
 * Runs only when USE_LOCAL_DB=true and triggered explicitly from the admin
 * dashboard ("Sync from Neon"). It snapshots every `gg_%` table from Neon and
 * replaces the matching rows in the local Postgres (local-dev/docker-compose.yml).
 *
 * Neon-call minimisation: a single metadata query lists the tables + columns,
 * and each table is read exactly once — no polling, no per-row requests. The
 * app itself never touches Neon while in local mode; this is the only path
 * that does, and only when an admin asks for it.
 *
 * Safety: Neon is only ever READ (SELECT / metadata). All writes — TRUNCATE +
 * INSERT — go to the local database inside one transaction, so a failure rolls
 * back and leaves local data intact. `gg_admin_sessions` is never synced so the
 * current admin session stays valid locally.
 */

export type SyncSummary = Record<string, number>;

export type SyncResult = {
  tables: number;
  rows: number;
  summary: SyncSummary;
};

/** Transient / regenerable tables that a sync must never overwrite locally. */
const EXCLUDED_TABLES = new Set(["gg_admin_sessions"]);

const CHUNK_SIZE = 200;

type ColumnInfo = {
  name: string;
  dataType: string;
  charLength: number | null;
  nullable: boolean;
};

function isJsonType(dataType: string): boolean {
  return dataType === "json" || dataType === "jsonb" || dataType === "ARRAY";
}

function pgColumnType(col: ColumnInfo): string {
  switch (col.dataType) {
    case "smallint":
      return "SMALLINT";
    case "integer":
      return "INTEGER";
    case "bigint":
      return "BIGINT";
    case "numeric":
      return "NUMERIC";
    case "real":
      return "REAL";
    case "double precision":
      return "DOUBLE PRECISION";
    case "text":
      return "TEXT";
    case "character varying":
      return col.charLength ? `VARCHAR(${col.charLength})` : "VARCHAR";
    case "character":
      return col.charLength ? `CHAR(${col.charLength})` : "CHAR";
    case "boolean":
      return "BOOLEAN";
    case "date":
      return "DATE";
    case "time without time zone":
      return "TIME";
    case "time with time zone":
      return "TIMETZ";
    case "timestamp without time zone":
      return "TIMESTAMP";
    case "timestamp with time zone":
      return "TIMESTAMPTZ";
    case "uuid":
      return "UUID";
    case "bytea":
      return "BYTEA";
    case "json":
    case "jsonb":
    case "ARRAY":
      return "JSONB";
    default:
      return "TEXT";
  }
}

type SourceRow = Record<string, unknown>;

/**
 * True when the Neon source (DATABASE_URL) answers a trivial query. Used by the
 * admin dashboard preflight so "Sync from Neon" disables gracefully when Neon
 * is unreachable (e.g. plan quota exceeded) instead of failing on click.
 */
export async function isNeonSourceAvailable(): Promise<boolean> {
  if (!process.env.DATABASE_URL) return false;
  const source = neon(process.env.DATABASE_URL);
  try {
    await Promise.race([
      source.query("SELECT 1", []),
      new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error("Neon source ping timed out.")), 8000);
      }),
    ]);
    return true;
  } catch {
    return false;
  }
}

/** Snapshot the Neon database down into the local Docker database. */
export async function syncFromNeon(): Promise<SyncResult> {
  if (!isLocalMode()) {
    throw new Error("Local mode is off — set USE_LOCAL_DB=true to sync.");
  }
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL (the Neon source) is not set.");
  }

  const source = neon(process.env.DATABASE_URL);
  const pool = new Pool({ connectionString: getLocalDbUrl(), max: 2 });
  const client = await pool.connect();
  const summary: SyncSummary = {};

  try {
    await client.query("BEGIN", []);

    const meta = (await source.query(
      `SELECT c.table_name AS name, c.column_name AS col, c.data_type AS type,
              c.character_maximum_length AS char_len, c.is_nullable AS nullable
         FROM information_schema.columns c
         JOIN information_schema.tables t
           ON t.table_schema = c.table_schema AND t.table_name = c.table_name
        WHERE c.table_schema = 'public'
          AND t.table_type = 'BASE TABLE'
          AND t.table_name LIKE 'gg\\_%'
        ORDER BY c.table_name, c.ordinal_position`,
      []
    )) as SourceRow[];

    const tables: { name: string; columns: ColumnInfo[] }[] = [];
    const tableIndex = new Map<string, { name: string; columns: ColumnInfo[] }>();
    for (const row of meta) {
      const name = String(row.name);
      if (EXCLUDED_TABLES.has(name)) continue;
      const col: ColumnInfo = {
        name: String(row.col),
        dataType: String(row.type ?? "text"),
        charLength: row.char_len == null ? null : Number(row.char_len),
        nullable: row.nullable !== "NO",
      };
      let entry = tableIndex.get(name);
      if (!entry) {
        entry = { name, columns: [] };
        tableIndex.set(name, entry);
        tables.push(entry);
      }
      entry.columns.push(col);
    }

    const targetTablesRes = await client.query(
      `SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'`,
      []
    );
    const targetTables = new Set(
      (targetTablesRes.rows as { table_name: string }[]).map((r) => r.table_name)
    );

    let totalRows = 0;

    for (const { name: table, columns } of tables) {
      if (!columns.length) continue;

      if (!targetTables.has(table)) {
        const columnDefs = columns
          .map((c) => `"${c.name}" ${pgColumnType(c)}${c.nullable ? "" : " NOT NULL"}`)
          .join(", ");
        await client.query(
          `CREATE TABLE "${table}" (${columnDefs})`,
          []
        );
      }

      await client.query(`TRUNCATE "${table}" RESTART IDENTITY`, []);

      const names = columns.map((c) => `"${c.name}"`).join(", ");
      const jsonColumns = new Set(columns.filter((c) => isJsonType(c.dataType)).map((c) => c.name));

      const rows = (await source.query(
        `SELECT ${names} FROM "${table}"`,
        []
      )) as SourceRow[];

      for (let i = 0; i < rows.length; i += CHUNK_SIZE) {
        const chunk = rows.slice(i, i + CHUNK_SIZE);
        const flat: unknown[] = [];
        const placeholders: string[] = [];

        for (const row of chunk) {
          const start = flat.length;
          for (const c of columns) {
            const value = row[c.name];
            flat.push(
              isJsonType(c.dataType) && value != null ? JSON.stringify(value) : value
            );
          }
          placeholders.push(
            `(${columns.map((_, j) => `$${start + j + 1}`).join(", ")})`
          );
        }

        if (flat.length) {
          await client.query(
            `INSERT INTO "${table}" (${columns.map((c) => `"${c.name}"`).join(", ")})
             VALUES ${placeholders.join(", ")}`,
            flat
          );
        }
      }

      summary[table] = rows.length;
      totalRows += rows.length;

      // Interleaved explicit-id inserts don't advance a serial sequence, so
      // move it past the highest id or the next local INSERT would collide.
      const hasId = columns.some((c) => c.name === "id");
      if (hasId && rows.length) {
        await client.query(
          `SELECT setval(pg_get_serial_sequence($1, 'id'),
                         GREATEST(COALESCE((SELECT MAX(id)::bigint FROM "${table}"), 1), 1),
                         true)
             FROM (SELECT 1) t
            WHERE pg_get_serial_sequence($1, 'id') IS NOT NULL`,
          [table]
        );
      }
    }

    await client.query("COMMIT", []);
    return { tables: tables.length, rows: totalRows, summary };
  } catch (error) {
    try {
      await client.query("ROLLBACK", []);
    } catch {
      // connection may be gone — the original error matters more
    }
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}