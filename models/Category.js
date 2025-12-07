const { pool } = require("../db");
const tableName = "categories";

async function getAllCategories() {
  const result = await pool.query(`SELECT * FROM ${tableName} ORDER BY id`);
  return result.rows;
}

async function getCategoryById(id) {
  const result = await pool.query(
    `SELECT * FROM ${tableName} WHERE id = $1`,
    [id]
);
return result.rows?.[0];
}

async function createCategory(dto) {
  const { name, description, photo } = dto;
  const result = await pool.query(
    `INSERT INTO ${tableName} (name, description, photo)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [name, description, photo]
  );
  return result.rows[0];
}

async function updateCategory(id, dto) {
  const { name, description, photo } = dto;
  const result = await pool.query(
    `UPDATE ${tableName}
       SET name = COALESCE($1, name),
           description = COALESCE($2, description),
           photo = COALESCE($3, photo),
           updated_at = NOW()
     WHERE id = $4
     RETURNING *`,
    [name, description, photo, id]
  );
  return result.rows[0];
}

async function deleteCategory(id) {
  const result = await pool.query(
    `DELETE FROM ${tableName} WHERE id = $1 RETURNING *`,
    [id]
  );
  return result.rows[0];
}

module.exports = {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
};
