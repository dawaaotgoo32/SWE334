const Payment = require("../models/payment");

class PaymentController {
    constructor() {
    this.model = new Payment();

    this.pay = this.pay.bind(this);
}

  // POST /api/payments
  // { order_id, method }
  async pay(req, res, next) {
    try {
      const userId = req.user.id;
      const { order_id, method } = req.body;

      if (!order_id) {
        return res.status(400).json({ message: "order_id шаардлагатай" });
      }

      const result = await this.model.payForOrder(userId, order_id, method);
      res.status(201).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new PaymentController();
