// controller/products.js
class ProductController {
  constructor(model) {
    this.model = model;

    this.getProducts = this.getProducts.bind(this);
    this.getProductById = this.getProductById.bind(this);
    this.createProduct = this.createProduct.bind(this);
  }

  async getProducts(req, res, next) {
    try {
      const page = parseInt(req.query.page, 10) || 0;
      const limit = parseInt(req.query.limit, 10) || 10;

      const products = await this.model.getAllProducts({ page, limit });
      res.status(200).json({
        success: true,
        data: products,
      });
    } catch (err) {
      next(err);
    }
  }

  async getProductById(req, res, next) {
    try {
      const id = req.params.id;
      const product = await this.model.getProductDetailById(id);

      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Product ID ${id} not found`,
        });
      }

      res.status(200).json({
        success: true,
        data: product,
      });
    } catch (err) {
      next(err);
    }
  }

  async createProduct(req, res, next) {
    try {
      const dto = req.body;
      const product = await this.model.createProductWithDetails(dto);

      res.status(201).json({
        success: true,
        data: product,
      });
    } catch (err) {
      console.error(err);
      next(err);
    }
  }
}

module.exports = ProductController;
