const express = require("express");
const { register, login, profile } = require("../controller/users");
const authGuard = require("../middleware/authGuard");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/profile", authGuard, profile);

module.exports = router;