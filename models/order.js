    const { pool } = require("../db");

    class Order {
    async insertOrder(userId, totalAmount, shippingAddress) {
        const result = await pool.query(
        `
        INSERT INTO "order" (user_id, status, total_amount, shipping_address)
        VALUES ($1, 'processing', $2, $3)
        RETURNING *
        `,
        [userId, totalAmount, shippingAddress]
        );
        return result.rows[0];
    }

    async insertOrderItem(
        orderId,
        productId,
        quantity,
        unitPrice,
        discountAmount = 0
    ) {
        await pool.query(
        `
        INSERT INTO order_details 
            (order_id, product_id, quantity, unit_price, discount_amount)
        VALUES ($1,      $2,         $3,       $4,         $5)
        `,
        [orderId, productId, quantity, unitPrice, discountAmount]
        );
    }

    async getOrdersByUser(userId) {
        const result = await pool.query(
        `
        SELECT *
        FROM "order"
        WHERE user_id = $1
        ORDER BY id DESC
        `,
        [userId]
        );
        return result.rows;
    }

    async getOrderById(orderId) {
        const result = await pool.query(
        `
        SELECT *
        FROM "order"
        WHERE id = $1
        `,
        [orderId]
        );
        return result.rows[0];
    }

    async getOrderItems(orderId) {
        const result = await pool.query(
        `
        SELECT 
            od.id,
            od.product_id,
            od.quantity,
            od.unit_price,
            od.discount_amount,
            od.total,
            p.name AS product_name
        FROM order_details od
        JOIN products p ON p.id = od.product_id
        WHERE od.order_id = $1
        `,
        [orderId]
        );
        return result.rows;
    }

    async updateOrderStatus(orderId, status) {
        const result = await pool.query(
        `
        UPDATE "order"
        SET status = $1
        WHERE id = $2
        RETURNING *
        `,
        [status, orderId]
        );
        return result.rows[0];
    }

    async getAllOrders() {
        const result = await pool.query(
        `
        SELECT *
        FROM "order"
        ORDER BY id DESC
        `
        );
        return result.rows;
    }

    async getOrdersByStatus(status) {
        const result = await pool.query(
        `
        SELECT *
        FROM "order"
        WHERE status = $1
        ORDER BY id DESC
        `,
        [status]
        );
        return result.rows;
    }

    async getCancelledOrFailedOrders() {
        const result = await pool.query(
        `
        SELECT *
        FROM "order"
        WHERE status IN ('cancelled', 'failed')
        ORDER BY id DESC
        `
        );
        return result.rows;
    }

    async addStatusHistory(orderId, oldStatus, newStatus, changedBy) {
        await pool.query(
        `
        INSERT INTO order_status_history
            (order_id, old_status, new_status, changed_by)
        VALUES ($1,       $2,         $3,        $4)
        `,
        [orderId, oldStatus, newStatus, changedBy]
        );
    }

    async getStatusHistory(orderId) {
        const result = await pool.query(
        `
        SELECT *
        FROM order_status_history
        WHERE order_id = $1
        ORDER BY changed_at ASC
        `,
        [orderId]
        );
        return result.rows;
    }

    async getAllStatusHistory() {
        const result = await pool.query(
        `
        SELECT 
            h.*,
            o.user_id AS order_owner_id,
            u.email AS changed_by_email
        FROM order_status_history h
        JOIN "order" o ON o.id = h.order_id
        LEFT JOIN users u ON u.id = h.changed_by
        ORDER BY h.changed_at DESC
        `
        );
        return result.rows;
    }
    }

    module.exports = Order;
