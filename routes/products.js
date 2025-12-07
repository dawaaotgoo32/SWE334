// routes/products.js
const express = require("express");
const ProductController = require("../controller/products");
const Product = require("../models/Product");
const authGuard = require("../middleware/authGuard");
const requireRoles = require("../middleware/roleGuard");

const router = express.Router();

const productController = new ProductController(new Product());

router
.route("/")
.get(productController.getProducts)                   
.post(authGuard, requireRoles(10), productController.createProduct); 

router
.route("/:id")
.get(productController.getProductById);                

module.exports = router;
