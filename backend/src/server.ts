import "dotenv/config";
import app from "./app";
import pool from "./config/database";
import { runMigrations } from "./config/migrate";

const PORT = Number(process.env.PORT ?? 5000);

async function start() {
  try {
    const result = await pool.query<{ now: Date }>("SELECT NOW() AS now");
    console.log(`[DB] Connected — server time: ${result.rows[0].now.toISOString()}`);
  } catch (err) {
    console.error("[DB] Connection failed:", (err as Error).message);
    process.exit(1);
  }

  try {
    await runMigrations();
  } catch (err) {
    console.error("[DB] Migration failed — aborting startup.");
    process.exit(1);
  }

  app.listen(PORT, () => {
    console.log(`[Server] Modern Mint API running on http://localhost:${PORT}`);
    console.log(`[Server] Environment: ${process.env.NODE_ENV ?? "development"}`);
  });
}

start();
