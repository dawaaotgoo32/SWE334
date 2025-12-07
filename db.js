const { Pool } = require("pg");


const hasDatabaseUrl = !!process.env.DATABASE_URL;

let pool;

if (hasDatabaseUrl) {
  // ---- RUNNING ON RENDER OR ANY HOSTED DB ----
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }, // required by many hosted Postgres (incl. Render)
  });
} else {
  // ---- LOCAL DEVELOPMENT ----
  pool = new Pool({
    host: "localhost",
    port: 5432,
    database: "postgres",
    user: "postgres",
    password: "Otgoo1335", // or your local password
  });
}

async function connectDB() {
  try {
    const client = await pool.connect();
    console.log("Connected to the database");
    client.release();
  } catch (err) {
    console.error("Database connection error", err);
    throw err;
  }
}

module.exports = { connectDB, pool };