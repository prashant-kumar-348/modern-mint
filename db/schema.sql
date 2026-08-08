-- Modern Mint — Database Schema
-- Run once against your PostgreSQL database to initialise the schema.
-- psql -d modernmint -f db/schema.sql

-- ── Extensions ────────────────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "pgcrypto";  -- provides gen_random_uuid()

-- ── Users ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id                UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  username          VARCHAR(50)   UNIQUE NOT NULL,
  email             VARCHAR(255)  UNIQUE NOT NULL,
  password_hash     VARCHAR(255)  NOT NULL,
  profile_image_url TEXT,
  created_at        TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- Existing databases: add the column idempotently (matches runMigrations()).
ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_image_url TEXT;

-- Auto-update updated_at on row changes
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_users_updated_at ON users;
CREATE TRIGGER trg_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Indexes for fast lookups during login
CREATE INDEX IF NOT EXISTS idx_users_email    ON users (email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users (username);
