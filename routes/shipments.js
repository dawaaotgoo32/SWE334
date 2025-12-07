const express = require("express");
const shipments = require("../controller/shipments");
const authGuard = require("../middleware/authGuard");
const requireRoles = require("../middleware/roleGuard");

const router = express.Router();

router.post("/", authGuard, requireRoles(10), shipments.create);
router.patch("/:id", authGuard, requireRoles(10), shipments.updateStatus);

router.get("/order/:orderId", authGuard, requireRoles(20, 10), shipments.getByOrder);

module.exports = router;
