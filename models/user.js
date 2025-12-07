// models/user.js
const { pool } = require("../db");
const tableName = "users";

async function getAllUsers() {
  const { rows } = await pool.query(
    `SELECT id, username, email, phone, role, is_active, created_at, updated_at
     FROM ${tableName} ORDER BY id DESC`
  );
  return rows;
}

async function getUserById(id) {
  const { rows } = await pool.query(
    `SELECT id, username, email, phone, role, is_active, created_at, updated_at
     FROM ${tableName} WHERE id = $1`,
    [id]
  );
  return rows?.[0];
}

async function getUserByEmail(email) {
  const { rows } = await pool.query(
    `SELECT * FROM ${tableName} WHERE email = $1`,
    [email]
  );
  return rows?.[0];
}

async function getUserByPhone(phone) {
  const { rows } = await pool.query(
    `SELECT * FROM ${tableName} WHERE phone = $1`,
    [phone]
  );
  return rows?.[0];
}

async function createUser({ username, email, phone, password, role }) {
const { rows } = await pool.query(
  `INSERT INTO ${tableName} (username, email, phone, password, role)
   VALUES ($1, $2, $3, $4, $5)
   RETURNING id, username, email, phone, role`,  
  [username, email, phone ?? null, password, role ?? "customer"]
);

}

async function updateUser(id, dto) {
  const fields = [];
  const values = [];
  let i = 1;
  for (const [k, v] of Object.entries(dto)) {
    fields.push(`${k} = $${i++}`);
    values.push(v);
  }
  if (!fields.length) return getUserById(id);
  values.push(id);

  const { rows } = await pool.query(
    `UPDATE ${tableName}
     SET ${fields.join(", ")}, updated_at = NOW()
     WHERE id = $${i}
     RETURNING id, username, email, phone, role, is_active, created_at, updated_at`,
    values
  );
  return rows?.[0];
}

async function deleteUser(id) {
  await pool.query(`DELETE FROM ${tableName} WHERE id = $1`, [id]);
  return { success: true };
}

module.exports = {
  getAllUsers,
  getUserById,
  getUserByEmail,
  getUserByPhone,
  createUser,
  updateUser,
  deleteUser,
};
