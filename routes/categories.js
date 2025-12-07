// routes/categories.js
const express = require("express");
const categories = require("../controller/categories");
const authGuard = require("../middleware/authGuard");
const requireRoles = require("../middleware/roleGuard");

const router = express.Router();

router.get("/", authGuard, categories.getCategories);
router.get("/:id", authGuard, categories.getCategory);

router.post("/", authGuard, requireRoles(10), categories.createCategory);
router.put("/:id", authGuard, requireRoles(10), categories.updateCategory);
router.delete("/:id", authGuard, requireRoles(10), categories.deleteCategory);

module.exports = router;
