const { Pool } = require("pg");
const pool = new Pool({
    host: "localhost",
    port: 5432,
    database: "postgres",
    user: "postgres",
    password: "Otgoo1335",
});
async function connectDB() {
    try {
        const client = await pool.connect();
        console.log("Connected to the database");
        client.release();
    } catch (err) {
        console.error("Database connection error", err);
        process.exit(1);
    }
}
module.exports = { connectDB, pool };