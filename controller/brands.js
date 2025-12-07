// controller/brands.js
const Brand = require("../models/brand");

class BrandsController {
  constructor() {
    this.model = new Brand();

    this.getBrands = this.getBrands.bind(this);
    this.getBrand = this.getBrand.bind(this);
    this.createBrand = this.createBrand.bind(this);
    this.updateBrand = this.updateBrand.bind(this);
    this.deleteBrand = this.deleteBrand.bind(this);
  }

  async getBrands(req, res, next) {
    try {
      const brands = await this.model.getAllBrands();
      res.status(200).json({ success: true, data: brands });
    } catch (err) {
      next(err);
    }
  }

  async getBrand(req, res, next) {
    try {
      const brand = await this.model.getBrandById(req.params.id);
      if (!brand)
        return res.status(404).json({ success: false, message: "Brand not found" });
      res.status(200).json({ success: true, data: brand });
    } catch (err) {
      next(err);
    }
  }

  async createBrand(req, res, next) {
    try {
      const { name } = req.body;
      if (!name) return res.status(400).json({ message: "Brand name required" });

      // check for duplicate
      const exists = await this.model.getBrandByName(name);
      if (exists)
        return res.status(409).json({ message: "Brand already exists" });

      const brand = await this.model.createBrand({ name });
      res.status(201).json({ success: true, data: brand });
    } catch (err) {
      next(err);
    }
  }

  async updateBrand(req, res, next) {
    try {
      const { id, name } = req.body;
      if (!id) return res.status(400).json({ message: "Brand ID required" });

      const brand = await this.model.updateBrand(id, { name });
      if (!brand)
        return res.status(404).json({ success: false, message: "Brand not found" });

      res.status(200).json({ success: true, data: brand });
    } catch (err) {
      next(err);
    }
  }

  async deleteBrand(req, res, next) {
    try {
      const { id } = req.body;
      if (!id) return res.status(400).json({ message: "Brand ID required" });

      const brand = await this.model.deleteBrand(id);
      if (!brand)
        return res.status(404).json({ success: false, message: "Brand not found" });

      res.status(200).json({
        success: true,
        message: `Brand '${brand.name}' deleted successfully`,
        data: brand,
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new BrandsController();
