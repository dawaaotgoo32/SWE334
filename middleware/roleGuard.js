// middleware/roleGuard.js
module.exports = function requireRoles(...allowed) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const userRole = Number(req.user.role); // 10 = admin, 20 = client
    const hasAccess = allowed.map(Number).includes(userRole);

    if (!hasAccess) {
      return res.status(403).json({ message: "Эрх хүрэлцэхгүй байна" });
    }

    next();
  };
};
