const { pool } = require("../db");

class Shipment {
  #table = "shipments";

  async createShipment(orderId, trackingNumber) {
    const res = await pool.query(
      `
      INSERT INTO ${this.#table}
        (order_id, tracking_number, status)
      VALUES ($1, $2, 'pending')
      RETURNING *
      `,
      [orderId, trackingNumber || null]
    );
    return res.rows[0];
  }

  async updateStatus(id, status) {
    const res = await pool.query(
      `
      UPDATE ${this.#table}
      SET status = $1, updated_at = NOW()
      WHERE id = $2
      RETURNING *
      `,
      [status, id]
    );
    return res.rows[0];
  }

  async getByOrder(orderId) {
    const res = await pool.query(
      `SELECT * FROM ${this.#table} WHERE order_id = $1`,
      [orderId]
    );
    return res.rows;
  }
}

module.exports = Shipment;
