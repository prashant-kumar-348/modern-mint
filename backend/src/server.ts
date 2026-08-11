import "dotenv/config";
import app from "./app";
import pool from "./config/database";
import { runMigrations } from "./config/migrate";
import http from "http";
import { setupSocket } from "./socket";

const PORT = Number(process.env.PORT) || 5000;

async function start() {
  // ── Database connection ────────────────────────────────────────────────
  try {
    const result = await pool.query<{ now: Date }>("SELECT NOW() AS now");

    console.log(
      `[DB] Connected — server time: ${result.rows[0].now.toISOString()}`
    );
  } catch (err) {
    console.error("[DB] Connection failed:", (err as Error).message);
    process.exit(1);
  }

  // ── Database migrations ────────────────────────────────────────────────
  try {
    await runMigrations();
  } catch (err) {
    console.error("[DB] Migration failed — aborting startup.");
    process.exit(1);
  }

  // ── HTTP server ────────────────────────────────────────────────────────
  const httpServer = http.createServer(app);

  // ── Socket.io ──────────────────────────────────────────────────────────
  setupSocket(httpServer);

  // ── Start server ───────────────────────────────────────────────────────
  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(
      `[Server] Modern Mint API running on http://0.0.0.0:${PORT}`
    );

    console.log(
      `[Server] Environment: ${process.env.NODE_ENV ?? "development"}`
    );
  });
}

start();