const express = require("express");
const cartController = require("../controller/cart");
const authGuard = require("../middleware/authGuard");
const requireRoles = require("../middleware/roleGuard");

const router = express.Router();

router.get("/", authGuard, cartController.getMyCart);
router.post("/", authGuard, cartController.addToCart);
router.patch("/", authGuard, cartController.updateCartItem);
router.delete("/", authGuard, cartController.removeFromCart);

router.get("/admin/abandoned", authGuard, requireRoles(10), cartController.getAbandoned);

module.exports = router;
