// models/Cart.js
const { pool } = require("../db");

class Cart {
    #tableName = "cart";

    async getCartByUser(userId) {
    const result = await pool.query(`
        SELECT
        c.id,
        c.product_id,
        c.quantity,
        p.name,
        p.price,
        (p.price * c.quantity) AS line_total
        FROM ${this.#tableName} c
        JOIN products p ON p.id = c.product_id
        WHERE c.user_id = $1`,[userId]);
    return result.rows;
}

async addOrUpdateItem(userId, productId, quantity) {
    // if exists -> update, else insert
    const existing = await pool.query(
        `SELECT id, quantity FROM ${this.#tableName}
        WHERE user_id = $1 AND product_id = $2`,
        [userId, productId]
    );

    if (existing.rowCount > 0) {
        const newQty = existing.rows[0].quantity + quantity;
        const result = await pool.query(
        `UPDATE ${this.#tableName}
        SET quantity = $1
        WHERE id = $2
         RETURNING *`,
        [newQty, existing.rows[0].id]);
        return result.rows[0];
    } else {
      const result = await pool.query(
        `INSERT INTO ${this.#tableName} (user_id, product_id, quantity)
         VALUES ($1, $2, $3)
         RETURNING *`,
        [userId, productId, quantity]
      );
      return result.rows[0];
    }
  }

  async updateItem(userId, productId, quantity) {
    const result = await pool.query(
      `UPDATE ${this.#tableName}
       SET quantity = $1
       WHERE user_id = $2 AND product_id = $3
       RETURNING *`,
      [quantity, userId, productId]
    );
    return result.rows[0];
  }

  async removeItem(userId, productId) {
    const result = await pool.query(
      `DELETE FROM ${this.#tableName}
       WHERE user_id = $1 AND product_id = $2
       RETURNING *`,
      [userId, productId]
    );
    return result.rows[0];
  }

  async clearCart(userId) {
    await pool.query(`DELETE FROM ${this.#tableName} WHERE user_id = $1`, [userId]);
  }
  async getAllAbandonedCarts() {
    const res = await pool.query(
      `
      SELECT 
        c.id,
        c.user_id,
        u.email,
        c.product_id,
        p.name AS product_name,
        c.quantity,
        c.created_at
      FROM cart c
      JOIN users u ON u.id = c.user_id
      JOIN products p ON p.id = c.product_id
      ORDER BY c.created_at DESC
      `
    );
    return res.rows;
  }
}

module.exports = Cart;
