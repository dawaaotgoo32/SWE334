const Shipment = require("../models/shipment");

class ShipmentsController {
  constructor() {
    this.model = new Shipment();

    this.create = this.create.bind(this);
    this.updateStatus = this.updateStatus.bind(this);
    this.getByOrder = this.getByOrder.bind(this);
  }

  async create(req, res, next) {
    try {
      const { order_id, tracking_number } = req.body;
      if (!order_id) {
        return res
          .status(400)
          .json({ message: "order_id хэрэгтэй" });
      }

      const shipment = await this.model.createShipment(order_id, tracking_number);
      res.status(201).json({ success: true, data: shipment });
    } catch (err) {
      next(err);
    }
  }

  async updateStatus(req, res, next) {
    try {
      const { status } = req.body;
      if (!status) {
        return res
          .status(400)
          .json({ message: "status хэрэгтэй" });
      }

      const updated = await this.model.updateStatus(req.params.id, status);
      res.status(200).json({ success: true, data: updated });
    } catch (err) {
      next(err);
    }
  }

  async getByOrder(req, res, next) {
    try {
      const shipments = await this.model.getByOrder(req.params.orderId);
      res.status(200).json({ success: true, data: shipments });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new ShipmentsController();
