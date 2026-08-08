import pool from "./database";

/**
 * Idempotent schema migration — runs on every server start.
 * All statements use IF NOT EXISTS so they are safe to re-run.
 */
export async function runMigrations(): Promise<void> {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // ── users: profile image (display-only) ──────────────────────────────────
    // The users table pre-exists; add the column idempotently so existing rows
    // and data are untouched. Stores a base64 image data URL (served via
    // GET /api/users/:id/avatar, never returned inline in room lists).
    await client.query(`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_image_url TEXT
    `);

    // ── rooms ──────────────────────────────────────────────────────────────
    await client.query(`
      CREATE TABLE IF NOT EXISTS rooms (
        id            UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
        name          VARCHAR(80)  NOT NULL,
        host_user_id  UUID         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        mode          VARCHAR(10)  NOT NULL CHECK (mode IN ('60mins','short','full')),
        privacy       VARCHAR(12)  NOT NULL CHECK (privacy IN ('open','closed','password')),
        password_hash TEXT,
        ai_difficulty VARCHAR(12)  NOT NULL DEFAULT 'easy'
                      CHECK (ai_difficulty IN ('easy','medium','hard','unfair','expert','legendary')),
        max_founders  SMALLINT     NOT NULL DEFAULT 4,
        max_investors SMALLINT     NOT NULL DEFAULT 2,
        status        VARCHAR(12)  NOT NULL DEFAULT 'waiting'
                      CHECK (status IN ('waiting','in_progress','finished')),
        created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
        updated_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
      )
    `);

    // ── room_players ───────────────────────────────────────────────────────
    await client.query(`
      CREATE TABLE IF NOT EXISTS room_players (
        id           UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
        room_id      UUID         NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
        user_id      UUID         REFERENCES users(id) ON DELETE CASCADE,
        role         VARCHAR(10)  NOT NULL CHECK (role IN ('founder','investor')),
        avatar_id    SMALLINT     NOT NULL DEFAULT 1,
        display_name VARCHAR(40)  NOT NULL,
        is_ai        BOOLEAN      NOT NULL DEFAULT FALSE,
        joined_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
      )
    `);

    // ── indexes ────────────────────────────────────────────────────────────
    await client.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS idx_room_players_unique_human
      ON room_players(room_id, user_id) WHERE user_id IS NOT NULL
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_room_players_room_id
      ON room_players(room_id)
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_rooms_status
      ON rooms(status)
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_rooms_created_at
      ON rooms(created_at DESC)
    `);

    await client.query("COMMIT");
    console.log("[Migrate] Schema up to date.");
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("[Migrate] Migration failed:", (err as Error).message);
    throw err;
  } finally {
    client.release();
  }
}
