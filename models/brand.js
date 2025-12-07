// models/Brand.js
const { pool } = require("../db");

class Brand {
  #tableName = "brand";

  async getAllBrands() {
    const result = await pool.query(`SELECT * FROM ${this.#tableName} ORDER BY id`);
    return result.rows;
  }

  async getBrandById(id) {
    const result = await pool.query(
      `SELECT * FROM ${this.#tableName} WHERE id = $1`,
      [id]
    );
    return result.rows?.[0];
  }

  async getBrandByName(name) {
    const result = await pool.query(
      `SELECT * FROM ${this.#tableName} WHERE LOWER(name) = LOWER($1)`,
      [name]
    );
    return result.rows?.[0];
  }

  async createBrand({ name }) {
    const result = await pool.query(
      `INSERT INTO ${this.#tableName} (name)
       VALUES ($1)
       RETURNING *`,
      [name]
    );
    return result.rows[0];
  }

  async updateBrand(id, { name }) {
    const result = await pool.query(
      `UPDATE ${this.#tableName}
         SET name = COALESCE($1, name),
             updated_at = NOW()
       WHERE id = $2
       RETURNING *`,
      [name, id]
    );
    return result.rows[0];
  }

  async deleteBrand(id) {
    const result = await pool.query(
      `DELETE FROM ${this.#tableName} WHERE id = $1 RETURNING *`,
      [id]
    );
    return result.rows[0];
  }
}

module.exports = Brand;
