-- ============================================================
-- Glow & Grace — Neon Postgres schema
-- The app also auto-creates these tables lazily at runtime
-- (see src/lib/db.ts -> SCHEMA_STATEMENTS). This file exists as
-- the canonical, documented source of truth.
-- ============================================================

-- Checkout orders
CREATE TABLE IF NOT EXISTS gg_orders (
  id SERIAL PRIMARY KEY,
  order_id VARCHAR(40) UNIQUE NOT NULL,          -- e.g. GG-2026-12345
  customer_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  address JSONB NOT NULL,                        -- street/locality/city/state/pincode
  items JSONB NOT NULL,                          -- [{productId,name,emoji,price,quantity}]
  subtotal INT NOT NULL,
  gst INT NOT NULL,
  shipping INT NOT NULL,
  total INT NOT NULL,
  delivery_option TEXT,
  payment_method TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Job applications (careers/[slug]/apply)
CREATE TABLE IF NOT EXISTS gg_job_applications (
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
);

-- Newsletter subscriptions
CREATE TABLE IF NOT EXISTS gg_newsletter_subscribers (
  id SERIAL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Anonymous cart / wishlist snapshots keyed by a local device id
CREATE TABLE IF NOT EXISTS gg_cart_snapshots (
  id SERIAL PRIMARY KEY,
  device_id TEXT UNIQUE NOT NULL,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  wishlist JSONB NOT NULL DEFAULT '[]'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Useful queries -------------------------------------------------

-- Recent orders
-- SELECT order_id, customer_name, total, created_at FROM gg_orders ORDER BY id DESC LIMIT 20;

-- Latest applications per role
-- SELECT job_title, full_name, phone, email, created_at FROM gg_job_applications ORDER BY id DESC LIMIT 20;

-- Subscriber count
-- SELECT count(*) FROM gg_newsletter_subscribers;