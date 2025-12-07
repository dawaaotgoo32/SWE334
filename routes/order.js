const express = require("express");
const orders = require("../controller/orders");
const authGuard = require("../middleware/authGuard");
const requireRoles = require("../middleware/roleGuard");

const router = express.Router();

router.post("/", authGuard, requireRoles(20, 10), orders.createOrder);
router.post("/pay", authGuard, requireRoles(20, 10), orders.payOrder);
router.get("/", authGuard, requireRoles(20, 10), orders.getMyOrders);
router.get("/:id", authGuard, requireRoles(20, 10), orders.getOrderDetail);

router.get("/admin/orders", authGuard, requireRoles(10), orders.getAdminOrders);
router.get("/admin/orders/cancelled-failed", authGuard, requireRoles(10), orders.getCancelledFailed);
router.patch("/:id/status", authGuard, requireRoles(10), orders.updateStatusAdmin);
router.get("/admin/logs/all", authGuard, requireRoles(10), orders.getAllStatusLogs);
router.get("/admin/:id/logs", authGuard, requireRoles(10), orders.getOrderStatusLogs);

module.exports = router;
