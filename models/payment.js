// models/payment.js
const { pool } = require("../db");

class Payment {
  // Pay for an order
  async payForOrder(userId, orderId, method = "card") {
    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      // 1) Check that the order exists and belongs to this user
      const orderRes = await client.query(
        `
        SELECT *
        FROM "order"
        WHERE id = $1 AND user_id = $2
        `,
        [orderId, userId]
      );

      if (orderRes.rowCount === 0) {
        throw new Error("Захиалга олдсонгүй эсвэл энэ хэрэглэгчид хамаарахгүй байна");
      }

      const order = orderRes.rows[0];

      if (order.status !== "processing") {
        throw new Error("Энэ захиалга төлбөр хийх шатанд биш байна");
      }

      const amount = order.total_amount;

      // 2) Insert payment
      const payRes = await client.query(
        `
        INSERT INTO payment (user_id, order_id, amount, status, method)
        VALUES ($1,        $2,       $3,     'completed', $4)
        RETURNING *
        `,
        [userId, orderId, amount, method]
      );

      const payment = payRes.rows[0];

      // 3) Update order with payment_id + status
      const updatedOrderRes = await client.query(
        `
        UPDATE "order"
        SET payment_id = $1,
            status     = 'paid'
        WHERE id = $2
        RETURNING *
        `,
        [payment.id, orderId]
      );

      const updatedOrder = updatedOrderRes.rows[0];

      await client.query("COMMIT");

      return {
        order: updatedOrder,
        payment,
      };
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
  }
  async createPayment(dto) {
    const {order_id, user_id} = dto
  }
  // Used by OrdersController.checkPaymentStatus
  async getPaymentByOrder(orderId) {
    const res = await pool.query(
      `SELECT * FROM payment WHERE order_id = $1`,
      [orderId]
    );
    return res.rows[0];
  }
}

module.exports = Payment;
