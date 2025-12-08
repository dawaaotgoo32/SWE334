const express = require("express");
const users = require("../controller/users");
const authGuard = require("../middleware/authGuard");

const router = express.Router();

router.post("/register", users.register);
router.post("/login", users.login);
router.get("/profile", authGuard, users.profile);

router.post("/send-otp", users.sendOtp);
router.post("/verify-otp", users.verifyOtp);

module.exports = router;