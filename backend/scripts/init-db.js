require("dotenv").config();
const { Pool } = require("pg");
const fs = require("fs");
const path = require("path");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function main() {
  const schemaPath = path.resolve(__dirname, "../../db/schema.sql");
  const sql = fs.readFileSync(schemaPath, "utf8");

  console.log("Connecting to database…");
  const client = await pool.connect();

  try {
    console.log("Applying schema…");
    await client.query(sql);
    console.log("✓ Schema applied.\n");

    const tables = await client.query(
      `SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name`
    );
    console.log("Tables:", tables.rows.map((r) => r.table_name).join(", "));

    const cols = await client.query(
      `SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'users' ORDER BY ordinal_position`
    );
    console.log("\nusers columns:");
    cols.rows.forEach((r) => console.log(`  • ${r.column_name} (${r.data_type})`));
    console.log("\n✓ Database ready.");
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((err) => {
  console.error("FATAL:", err.message);
  process.exit(1);
});
