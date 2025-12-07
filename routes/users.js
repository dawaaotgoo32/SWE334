const express = require("express");
const authGuard = require("../middleware/authGuard");
const requireRoles = require("../middleware/roleGuard");
const users = require("../controller/users");

const router = express.Router();

router.get("/",     authGuard, requireRoles(10),      users.list);
router.post("/",    authGuard, requireRoles(10),      users.create);
router.get("/:id",  authGuard, requireRoles(10, 20),  users.get);
router.patch("/:id",authGuard, requireRoles(10, 20),  users.update);
router.delete("/:id",authGuard, requireRoles(10),     users.remove);

router.patch("/:id/password", authGuard, users.changePassword);


module.exports = router;
