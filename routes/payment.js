const express = require("express");
const payment = require("../controller/payment");
const authGuard = require("../middleware/authGuard");
const requireRoles = require("../middleware/roleGuard");

const router = express.Router();

router.post("/", authGuard, requireRoles(20, 10), payment.pay);

module.exports = router;
