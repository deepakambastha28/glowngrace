import { neon, type NeonQueryFunction } from "@neondatabase/serverless";
import { Pool } from "pg";

/**
 * Postgres connection helper for Glow & Grace.
 *
 * Two backends, switched by `USE_LOCAL_DB`:
 *
 * - Cloud (USE_LOCAL_DB != "true") — Neon via @neondatabase/serverless over
 *   `DATABASE_URL`. Zero-config serverless queries; schema auto-created
 *   idempotently (see SCHEMA_STATEMENTS).
 * - Local (USE_LOCAL_DB = "true") — Docker-Postgres
 *   (local-dev/docker-compose.yml, `npm run db:up`) via the `pg` driver. The
 *   Neon HTTP driver cannot talk to a plain Postgres, hence the different
 *   client. DATABASE_URL stays set to the Neon URL and is only consulted by
 *   the explicit admin "Sync from Neon" action (see /api/admin/sync), so the
 *   app never touches Neon while working locally.
 *
 * Both backends expose the same `query(text, params)` shape returning row
 * objects. It returns `null` (graceful no-op) only when a database is
 * configured but unreachable errors should pause writes — and `isDbConfigured()`
 * is false only when no backend is configured at all, so the app still builds
 * and runs without a database.
 */

type NeonQuery = NeonQueryFunction<boolean, boolean>;

interface DbClient {
  query(text: string, params: unknown[]): Promise<Record<string, unknown>[]>;
}

let neonSql: NeonQuery | null = null;
let pgPool: Pool | null = null;
let schemaPromise: Promise<void> | null = null;

const SCHEMA_STATEMENTS: string[] = [
  `CREATE TABLE IF NOT EXISTS gg_orders (
    id SERIAL PRIMARY KEY,
    order_id VARCHAR(40) UNIQUE NOT NULL,
    customer_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    address JSONB NOT NULL,
    items JSONB NOT NULL,
    subtotal INT NOT NULL,
    gst INT NOT NULL,
    shipping INT NOT NULL,
    total INT NOT NULL,
    delivery_option TEXT,
    payment_method TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
  )`,
  `CREATE TABLE IF NOT EXISTS gg_job_applications (
    id SERIAL PRIMARY KEY,
    job_id TEXT,
    job_slug TEXT NOT NULL,
    job_title TEXT NOT NULL,
    full_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT NOT NULL,
    city TEXT NOT NULL,
    experience TEXT,
    specialization TEXT,
    qualification TEXT,
    cover_note TEXT,
    resume_name TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
  )`,
  `CREATE TABLE IF NOT EXISTS gg_cart_snapshots (
    id SERIAL PRIMARY KEY,
    device_id TEXT UNIQUE NOT NULL,
    items JSONB NOT NULL DEFAULT '[]'::jsonb,
    wishlist JSONB NOT NULL DEFAULT '[]'::jsonb,
    updated_at TIMESTAMPTZ DEFAULT now()
  )`,
`CREATE TABLE IF NOT EXISTS gg_admin_products (
    id SERIAL PRIMARY KEY,
    slug TEXT UNIQUE NOT NULL,
    emoji TEXT NOT NULL,
    brand TEXT NOT NULL,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    price INT NOT NULL,
    old_price INT NOT NULL DEFAULT 0,
    stock INT NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'Active',
    description TEXT NOT NULL DEFAULT '',
    description_html TEXT NOT NULL DEFAULT '',
    features JSONB NOT NULL DEFAULT '[]'::jsonb,
    tags JSONB NOT NULL DEFAULT '[]'::jsonb,
    image_data TEXT,
    shade TEXT,
    size TEXT,
    finish TEXT,
    ingredients TEXT,
    is_new BOOLEAN NOT NULL DEFAULT false,
    hidden BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
  )`,
  `CREATE TABLE IF NOT EXISTS gg_admin_jobs (
    id SERIAL PRIMARY KEY,
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    salon TEXT NOT NULL,
    location TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'Full Time',
    salary_min INT NOT NULL DEFAULT 0,
    salary_max INT NOT NULL DEFAULT 0,
    salary_text TEXT NOT NULL,
    experience TEXT NOT NULL,
    openings INT NOT NULL DEFAULT 1,
    description TEXT NOT NULL DEFAULT '',
    requirements JSONB NOT NULL DEFAULT '[]'::jsonb,
    status TEXT NOT NULL DEFAULT 'Open',
    hidden BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
  )`,
  `CREATE TABLE IF NOT EXISTS gg_admin_reviews (
    id SERIAL PRIMARY KEY,
    author TEXT NOT NULL,
    initial TEXT NOT NULL,
    product TEXT NOT NULL,
    rating INT NOT NULL,
    comment TEXT NOT NULL,
    location TEXT,
    status TEXT NOT NULL DEFAULT 'Approved',
    created_at TIMESTAMPTZ DEFAULT now()
  )`,
  `CREATE TABLE IF NOT EXISTS gg_admin_sessions (
    id SERIAL PRIMARY KEY,
    token TEXT UNIQUE NOT NULL,
    email TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
  )`,
  `CREATE TABLE IF NOT EXISTS gg_newsletter_subscribers (
    id SERIAL PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
  )`,
  `CREATE TABLE IF NOT EXISTS gg_partners (
    id SERIAL PRIMARY KEY,
    owner_name TEXT NOT NULL,
    salon_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    city TEXT NOT NULL,
    services TEXT NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
  )`,
  `CREATE TABLE IF NOT EXISTS gg_admin_partners (
    id SERIAL PRIMARY KEY,
    slug TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'Beauty Parlour',
    loc TEXT NOT NULL DEFAULT '',
    emoji TEXT NOT NULL DEFAULT '💄',
    gradient TEXT NOT NULL DEFAULT '',
    rating NUMERIC(2,1) NOT NULL DEFAULT 4.5,
    reviews INT NOT NULL DEFAULT 0,
    estd INT NOT NULL DEFAULT 2024,
    staff INT NOT NULL DEFAULT 1,
    services INT NOT NULL DEFAULT 1,
    description TEXT NOT NULL DEFAULT '',
    tags JSONB NOT NULL DEFAULT '[]'::jsonb,
    gallery JSONB NOT NULL DEFAULT '[]'::jsonb,
    banner_image TEXT,
    menu JSONB NOT NULL DEFAULT '[]'::jsonb,
    status TEXT NOT NULL DEFAULT 'Active',
    created_at TIMESTAMPTZ DEFAULT now()
  )`,
  `ALTER TABLE gg_admin_partners ADD COLUMN IF NOT EXISTS banner_image TEXT`,
  `CREATE TABLE IF NOT EXISTS gg_candidates (
    id SERIAL PRIMARY KEY,
    user_email TEXT NOT NULL,
    full_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT NOT NULL,
    city TEXT NOT NULL,
    experience TEXT NOT NULL DEFAULT '',
    specialization TEXT NOT NULL DEFAULT '',
    qualification TEXT NOT NULL DEFAULT '',
    bio TEXT NOT NULL DEFAULT '',
    skills JSONB NOT NULL DEFAULT '[]'::jsonb,
    gallery JSONB NOT NULL DEFAULT '[]'::jsonb,
    resume_name TEXT,
    status TEXT NOT NULL DEFAULT 'Active',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
  )`,
  `ALTER TABLE gg_admin_products ADD COLUMN IF NOT EXISTS hidden BOOLEAN NOT NULL DEFAULT false`,
  `ALTER TABLE gg_admin_products ADD COLUMN IF NOT EXISTS gallery JSONB NOT NULL DEFAULT '[]'::jsonb`,
  `ALTER TABLE gg_admin_jobs ADD COLUMN IF NOT EXISTS hidden BOOLEAN NOT NULL DEFAULT false`,
  `ALTER TABLE gg_admin_jobs ADD COLUMN IF NOT EXISTS responsibilities JSONB NOT NULL DEFAULT '[]'::jsonb`,
  `ALTER TABLE gg_admin_jobs ADD COLUMN IF NOT EXISTS perks JSONB NOT NULL DEFAULT '[]'::jsonb`,
  `ALTER TABLE gg_admin_jobs ADD COLUMN IF NOT EXISTS verified BOOLEAN NOT NULL DEFAULT false`,
  `CREATE TABLE IF NOT EXISTS gg_admin_events (
    id SERIAL PRIMARY KEY,
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'Workshop',
    emoji TEXT NOT NULL DEFAULT '🎉',
    gradient TEXT NOT NULL DEFAULT 'linear-gradient(135deg,#d6336c,#f4a6c0)',
    date TEXT NOT NULL,
    time TEXT NOT NULL DEFAULT '10:00 AM',
    loc TEXT NOT NULL DEFAULT '',
    venue TEXT NOT NULL DEFAULT '',
    price TEXT NOT NULL DEFAULT 'Free',
    capacity INT NOT NULL DEFAULT 50,
    spots_left INT NOT NULL DEFAULT 50,
    description TEXT NOT NULL DEFAULT '',
    agenda JSONB NOT NULL DEFAULT '[]'::jsonb,
    tags JSONB NOT NULL DEFAULT '[]'::jsonb,
    hidden BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
  )`,
  `CREATE TABLE IF NOT EXISTS gg_recruiters (
    id SERIAL PRIMARY KEY,
    user_email TEXT NOT NULL,
    full_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT NOT NULL,
    company TEXT NOT NULL DEFAULT '',
    designation TEXT NOT NULL DEFAULT '',
    city TEXT NOT NULL DEFAULT '',
    bio TEXT NOT NULL DEFAULT '',
    status TEXT NOT NULL DEFAULT 'Active',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
  )`,
  `CREATE TABLE IF NOT EXISTS gg_recruiter_hires (
    id SERIAL PRIMARY KEY,
    recruiter_email TEXT NOT NULL,
    candidate_id INT NOT NULL,
    candidate_name TEXT NOT NULL,
    candidate_email TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
  )`,
  `CREATE TABLE IF NOT EXISTS gg_recruiter_packages (
    id SERIAL PRIMARY KEY,
    recruiter_email TEXT NOT NULL,
    name TEXT NOT NULL,
    price INT NOT NULL DEFAULT 0,
    duration TEXT NOT NULL DEFAULT '',
    description TEXT NOT NULL DEFAULT '',
    services JSONB NOT NULL DEFAULT '[]'::jsonb,
    status TEXT NOT NULL DEFAULT 'Active',
    created_at TIMESTAMPTZ DEFAULT now()
  )`,
  `ALTER TABLE gg_recruiters ADD COLUMN IF NOT EXISTS gallery JSONB NOT NULL DEFAULT '[]'::jsonb`,
  `ALTER TABLE gg_recruiters ADD COLUMN IF NOT EXISTS services JSONB NOT NULL DEFAULT '[]'::jsonb`,
  `CREATE TABLE IF NOT EXISTS gg_admin_home_config (
    id INT PRIMARY KEY DEFAULT 1,
    config JSONB NOT NULL DEFAULT '{}'::jsonb,
    updated_at TIMESTAMPTZ DEFAULT now()
  )`,
  `CREATE TABLE IF NOT EXISTS gg_admin_shop_config (
    id INT PRIMARY KEY DEFAULT 1,
    config JSONB NOT NULL DEFAULT '{}'::jsonb,
    updated_at TIMESTAMPTZ DEFAULT now()
  )`,
  `CREATE TABLE IF NOT EXISTS gg_users (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT NOT NULL DEFAULT '',
    role TEXT NOT NULL DEFAULT 'user',
    status TEXT NOT NULL DEFAULT 'active',
    password_hash TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
  )`,
];

/** True when the app is configured to run against the local Docker database. */
export function isLocalMode(): boolean {
  return process.env.USE_LOCAL_DB === "true";
}

/**
 * Resolve the local Docker database URL. LOCAL_DB_URL wins when set; otherwise
 * the individual LOCAL_DB_* parts compose it. Defaults match
 * local-dev/docker-compose.yml so `USE_LOCAL_DB=true` alone is enough after
 * `npm run db:up`.
 */
export function getLocalDbUrl(): string {
  if (process.env.LOCAL_DB_URL?.trim()) return process.env.LOCAL_DB_URL;
  const user = process.env.LOCAL_DB_USER || "gg";
  const password = process.env.LOCAL_DB_PASSWORD || "gg";
  const host = process.env.LOCAL_DB_HOST || "localhost";
  const port = process.env.LOCAL_DB_PORT || "5433";
  const name = process.env.LOCAL_DB_NAME || "glowngrace";
  return `postgres://${user}:${password}@${host}:${port}/${name}`;
}

/** The URL the app currently reads/writes, or null when no backend is set. */
function resolveDbUrl(): string | null {
  if (isLocalMode()) return getLocalDbUrl();
  return process.env.DATABASE_URL || null;
}

function getClient(): DbClient | null {
  const url = resolveDbUrl();
  if (!url) return null;

  if (isLocalMode()) {
    if (!pgPool) {
      pgPool = new Pool({
        connectionString: url,
        max: 5,
        idleTimeoutMillis: 30_000,
        connectionTimeoutMillis: 10_000,
      });
    }
    return {
      query: async (text, params) => {
        const result = await pgPool!.query(text, params);
        return result.rows as Record<string, unknown>[];
      },
    };
  }

  if (!neonSql) {
    neonSql = neon(url);
  }
  return {
    query: async (text, params) => {
      const rows = await neonSql!.query(text, params);
      return rows as Record<string, unknown>[];
    },
  };
}

function ensureSchema(db: DbClient): Promise<void> {
  if (!schemaPromise) {
    schemaPromise = (async () => {
      for (const statement of SCHEMA_STATEMENTS) {
        try {
          await db.query(statement, []);
        } catch {
          // Ignore per-statement failures (the table may already exist or a
          // cold connection hiccuped); later queries still work.
        }
      }
    })();
  }
  return schemaPromise;
}

export type DbResult = Record<string, unknown>[] | null;

/** True when Neon refused the request because the account/project quota was exceeded (HTTP 402). */
export function isNeonQuotaError(error: unknown): boolean {
  return (
    error instanceof Error &&
    /^Server error \(HTTP status 402\): .*quota/i.test(error.message)
  );
}

/**
 * Run a parameterised query. Returns null when no database is configured or
 * when Neon is quota-suspended; other errors propagate.
 */
export async function query(
  text: string,
  params: unknown[] = []
): Promise<DbResult> {
  const db = getClient();
  if (!db) return null;
  await ensureSchema(db);
  try {
    return await db.query(text, params);
  } catch (error) {
    if (isNeonQuotaError(error)) {
      console.error(
        "Neon database suspended (plan quota exceeded) — continuing without persistence.",
        error
      );
      return null;
    }
    throw error;
  }
}

/**
 * The active database client (local pg Pool or Neon), or null when neither is
 * configured and the app is running without persistence.
 */
export function getDb(): DbClient | null {
  return getClient();
}

/** True when a database backend is configured (local Docker or Neon). */
export function isDbConfigured(): boolean {
  return Boolean(resolveDbUrl());
}