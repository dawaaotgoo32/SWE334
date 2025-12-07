const Cart = require("../models/cart");

class CartController {
  constructor() {
    this.model = new Cart();

    this.getMyCart = this.getMyCart.bind(this);
    this.addToCart = this.addToCart.bind(this);
    this.updateCartItem = this.updateCartItem.bind(this);
    this.removeFromCart = this.removeFromCart.bind(this);
    this.getAbandoned = this.getAbandoned.bind(this);
  }

  async getMyCart(req, res, next) {
    try {
      const userId = req.user.id;
      const items = await this.model.getCartByUser(userId);

      const total = items.reduce((sum, row) => sum + Number(row.line_total), 0);

      res.status(200).json({
        success: true,
        data: { items, total },
      });
    } catch (err) {
      next(err);
    }
  }

  async addToCart(req, res, next) {
    try {
      const userId = req.user.id;
      const { product_id, quantity } = req.body;

      if (!product_id || !quantity) {
        return res.status(400).json({ message: "product_id and quantity required" });
      }

      const item = await this.model.addOrUpdateItem(userId, product_id, quantity);
      res.status(201).json({ success: true, data: item });
    } catch (err) {
      next(err);
    }
  }

  async updateCartItem(req, res, next) {
    try {
      const userId = req.user.id;
      const { product_id, quantity } = req.body;

      if (!product_id || !quantity) {
        return res.status(400).json({ message: "product_id and quantity required" });
      }

      const item = await this.model.updateItem(userId, product_id, quantity);
      res.status(200).json({ success: true, data: item });
    } catch (err) {
      next(err);
    }
  }

  async removeFromCart(req, res, next) {
    try {
      const userId = req.user.id;
      const { product_id } = req.body;

      if (!product_id) {
        return res.status(400).json({ message: "product_id required" });
      }

      const removed = await this.model.removeItem(userId, product_id);
      res.status(200).json({ success: true, data: removed });
    } catch (err) {
      next(err);
    }
  }
  async getAbandoned(req, res, next) {
    try {
      const data = await this.model.getAllAbandonedCarts();
      res.status(200).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }
  
}

module.exports = new CartController();
