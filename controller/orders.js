const Order = require("../models/order");
const Cart = require("../models/cart");
const Payment = require("../models/payment");

class OrdersController {
  constructor() {
    this.orderModel = new Order();
    this.cartModel = new Cart();
    this.paymentModel = new Payment();

    // user 
    this.createOrder = this.createOrder.bind(this);
    this.payOrder = this.payOrder.bind(this);
    this.checkPaymentStatus = this.checkPaymentStatus.bind(this);
    this.getMyOrders = this.getMyOrders.bind(this);
    this.getOrderDetail = this.getOrderDetail.bind(this);

    // admin 
    this.updateStatusAdmin = this.updateStatusAdmin.bind(this);
    this.getAdminOrders = this.getAdminOrders.bind(this);
    this.getCancelledFailed = this.getCancelledFailed.bind(this);
    this.getAllStatusLogs = this.getAllStatusLogs.bind(this);
    this.getOrderStatusLogs = this.getOrderStatusLogs.bind(this);
  }

  async createOrder(req, res, next) {
    try {
      const userId = req.user.id;
      const { shipping_address } = req.body;

      if (!shipping_address) {
        return res
          .status(400)
          .json({ message: "shipping_address шаардлагатай" });
      }

      const cartItems = await this.cartModel.getCartByUser(userId);
      if (cartItems.length === 0) {
        return res.status(400).json({ message: "Сагс хоосон байна" });
      }

      const total = cartItems.reduce(
        (sum, item) => sum + Number(item.price) * item.quantity,
        0
      );

      const order = await this.orderModel.insertOrder(
        userId,
        total,
        shipping_address
      );

      for (const item of cartItems) {
        await this.orderModel.insertOrderItem(
          order.id,
          item.product_id,
          item.quantity,
          item.price
        );
      }

      await this.cartModel.clearCart(userId);

      // статусын түүх (лог) – анх үүсэх үед
      await this.orderModel.addStatusHistory(
        order.id,
        null,
        order.status,
        userId
      );

      res.status(201).json({ success: true, data: order });
    } catch (err) {
      next(err);
    }
  }

  async payOrder(req, res, next) {
    try {
      const userId = req.user.id;
      const { order_id, method } = req.body;

      if (!order_id) {
        return res.status(400).json({ message: "order_id хэрэгтэй" });
      }

      const before = await this.orderModel.getOrderById(order_id);
      if (!before) {
        return res.status(404).json({ message: "Захиалга олдсонгүй" });
      }

      const result = await this.paymentModel.payForOrder(
        userId,
        order_id,
        method
      );
      const { order } = result;

      // төлбөр төлөгдсөний дараах статусын өөрчлөлтийн лог
      await this.orderModel.addStatusHistory(
        order.id,
        before.status,
        order.status,
        userId
      );

      res.status(200).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  async checkPaymentStatus(req, res, next) {
    try {
      const orderId = req.params.id;
      const userId = req.user.id;
      const isAdmin = Number(req.user.role) === 10;

      const order = await this.orderModel.getOrderById(orderId);
      if (!order || (!isAdmin && order.user_id !== userId)) {
        return res.status(404).json({ message: "Захиалга олдсонгүй" });
      }

      const payment = await this.paymentModel.getPaymentByOrder(orderId);

      if (!payment) {
        return res.status(200).json({
          success: true,
          data: {
            order_id: orderId,
            status: "not_paid",
            message: "Төлбөр хийгдээгүй байна",
          },
        });
      }

      return res.status(200).json({
        success: true,
        data: {
          order_id: orderId,
          payment_status: payment.status,
          method: payment.method,
          amount: payment.amount,
          created_at: payment.created_at,
        },
      });
    } catch (err) {
      next(err);
    }
  }

  async getMyOrders(req, res, next) {
    try {
      const orders = await this.orderModel.getOrdersByUser(req.user.id);
      res.status(200).json({ success: true, data: orders });
    } catch (err) {
      next(err);
    }
  }

  async getOrderDetail(req, res, next) {
    try {
      const orderId = req.params.id;
      const userId = req.user.id;
      const isAdmin = Number(req.user.role) === 10;

      const order = await this.orderModel.getOrderById(orderId);

      if (!order || (!isAdmin && order.user_id !== userId)) {
        return res.status(404).json({ message: "Захиалга олдсонгүй" });
      }

      const items = await this.orderModel.getOrderItems(orderId);

      res.status(200).json({
        success: true,
        data: { ...order, items },
      });
    } catch (err) {
      next(err);
    }
  }

  async updateStatusAdmin(req, res, next) {
    try {
      const orderId = req.params.id;
      const { status } = req.body;

      if (!status) {
        return res.status(400).json({ message: "status хэрэгтэй" });
      }

      const existing = await this.orderModel.getOrderById(orderId);
      if (!existing) {
        return res.status(404).json({ message: "Захиалга олдсонгүй" });
      }

      const updated = await this.orderModel.updateOrderStatus(orderId, status);

      await this.orderModel.addStatusHistory(
        orderId,
        existing.status,
        updated.status,
        req.user.id
      );

      res.status(200).json({ success: true, data: updated });
    } catch (err) {
      next(err);
    }
  }

  async getAdminOrders(req, res, next) {
    try {
      const { status } = req.query;
      let data;

      if (status && status.trim() !== "") {
        if (this.orderModel.getOrdersByStatus) {
          data = await this.orderModel.getOrdersByStatus(status);
        } else {
          data = await this.orderModel.getAllOrders(); // fallback
          data = data.filter((o) => o.status === status);
        }
      } else {
        data = await this.orderModel.getAllOrders();
      }

      res.status(200).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  async getCancelledFailed(req, res, next) {
    try {
      if (this.orderModel.getCancelledOrFailedOrders) {
        const data = await this.orderModel.getCancelledOrFailedOrders();
        return res.status(200).json({ success: true, data });
      }

      const all = await this.orderModel.getAllOrders();
      const data = all.filter((o) =>
        ["cancelled", "failed"].includes(o.status)
      );
      return res.status(200).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  async getAllStatusLogs(req, res, next) {
    try {
      if (!this.orderModel.getAllStatusHistory) {
        return res
          .status(500)
          .json({ message: "getAllStatusHistory төгсгөлгүй байна (model-д)" });
      }

      const data = await this.orderModel.getAllStatusHistory();
      res.status(200).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  async getOrderStatusLogs(req, res, next) {
    try {
      const orderId = req.params.id;

      if (!this.orderModel.getStatusHistory) {
        return res
          .status(500)
          .json({ message: "getStatusHistory төгсгөлгүй байна (model-д)" });
      }

      const data = await this.orderModel.getStatusHistory(orderId);
      res.status(200).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new OrdersController();
