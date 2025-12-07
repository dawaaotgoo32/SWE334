// routes/brands.js
const express = require("express");
const brands = require("../controller/brands");
const authGuard = require("../middleware/authGuard");
const requireRoles = require("../middleware/roleGuard");

const router = express.Router();

// View (all authenticated users)
router.get("/", authGuard, brands.getBrands);
router.get("/:id", authGuard, brands.getBrand);

// Manage (admin only)
router.post("/", authGuard, requireRoles(10), brands.createBrand);
router.patch("/:id", authGuard, requireRoles(10), brands.updateBrand);
router.delete("/", authGuard, requireRoles(10), brands.deleteBrand);

module.exports = router;
