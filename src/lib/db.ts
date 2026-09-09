import { neon, type NeonQueryFunction } from "@neondatabase/serverless";

/**
 * Neon serverless Postgres connection helper.
 *
 * - Lazy-initialised from `process.env.DATABASE_URL`.
 * - Returns `null` (graceful no-op) when the database is not configured,
 *   so the app builds and runs locally and in CI without a database.
 * - Schema is idempotently ensured before the first write (see SCHEMA_STATEMENTS).
 */

type SqlQuery = NeonQueryFunction<boolean, boolean>;

let sql: SqlQuery | null = null;
let schemaReady = false;

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
];

export function getDb(): SqlQuery | null {
  if (!process.env.DATABASE_URL) return null;
  if (!sql) {
    sql = neon(process.env.DATABASE_URL);
  }
  return sql;
}

async function ensureSchema(db: SqlQuery): Promise<void> {
  if (schemaReady) return;
  for (const statement of SCHEMA_STATEMENTS) {
    await db.query(statement);
  }
  schemaReady = true;
}

export type DbResult = Record<string, unknown>[] | null;

/** Run a parameterised query. Returns null when the DB is not configured. */
export async function query(
  text: string,
  params: unknown[] = []
): Promise<DbResult> {
  const db = getDb();
  if (!db) return null;
  await ensureSchema(db);
  const rows = (await db.query(text, params)) as unknown[];
  return rows as Record<string, unknown>[];
}

/** True when a Neon database is configured. */
export function isDbConfigured(): boolean {
  return Boolean(process.env.DATABASE_URL);
}