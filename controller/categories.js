// controller/categories.js
const Category = require("../models/Category");

class CategoriesController {
  constructor() {
    this.getCategories = this.getCategories.bind(this);
    this.getCategory = this.getCategory.bind(this);
    this.createCategory = this.createCategory.bind(this);
    this.updateCategory = this.updateCategory.bind(this);
    this.deleteCategory = this.deleteCategory.bind(this);
  }

  // 🟢 GET: all categories (any logged-in user)
  async getCategories(req, res, next) {
    try {
      const categories = await Category.getAllCategories();
      res.status(200).json({ success: true, data: categories });
    } catch (err) {
      next(err);
    }
  }

  // 🟢 GET: one category by ID (any logged-in user)
  async getCategory(req, res, next) {
    try {
      const category = await Category.getCategoryById(req.params.id);
      if (!category) {
        return res.status(404).json({
          success: false,
          message: `Category ID ${req.params.id} not found`,
        });
      }
      res.status(200).json({ success: true, data: category });
    } catch (err) {
      next(err);
    }
  }

  // 🟢 POST: create category (admin only)
  async createCategory(req, res, next) {
    try {
      const { name, description, photo } = req.body;

      if (!name) {
        return res.status(400).json({ message: "Category name is required" });
      }

      const category = await Category.createCategory({ name, description, photo });
      res.status(201).json({ success: true, data: category });
    } catch (err) {
      next(err);
    }
  }

  // 🟡 PATCH: update category (admin only)
  // ID comes from body, not URL
  async updateCategory(req, res, next) {
    try {
      const { name, description, photo } = req.body;
      const id = req.params.id
      if (!id) {
        return res.status(400).json({ message: "Category ID is required" });
      }
      
      const category = await Category.updateCategory(id, { name, description, photo });
      if (!category) {
        return res.status(404).json({ message: `Category ID ${id} not found` });
      }

      res.status(200).json({ success: true, data: category });
    } catch (err) {
      next(err);
    }
  }

  // 🔴 DELETE: delete category (admin only)
  async deleteCategory(req, res, next) {
    try {
const id = req.params.id
        if (!id) {
        return res.status(400).json({ message: "Category ID is required" });
      }

      const category = await Category.deleteCategory(id);
      if (!category) {
        return res.status(404).json({ message: `Category ID ${id} not found` });
      }

      res.status(200).json({
        success: true,
        message: `Category '${category.name}' deleted successfully`,
        data: category,
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new CategoriesController();
