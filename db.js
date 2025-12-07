// db.js
const { Pool } = require("pg");

const isProd = process.env.NODE_ENV === "production";

let pool;

if (isProd) {
    // ---- RUNNING ON RENDER ----
    pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false },  // Render PostgreSQL needs SSL
    });
} else {
    // ---- LOCAL DEVELOPMENT ----
    pool = new Pool({
        host: "localhost",
        port: 5432,
        database: "postgres",
        user: "postgres",
        password: "Otgoo1335",
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