const jwt = require("jsonwebtoken");
const User = require("../models/User");

const auth = async (req, res, next) => {
  try {
    const header = req.headers.authorization;
    if (!header) return res.status(401).json({ message: "No token" });
    const token = header.split(" ")[1];
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(payload.id).select("-password");
    if (!user) return res.status(401).json({ message: "Invalid token" });
    req.user = user;
    next();
  } catch (err) {
    return res
      .status(401)
      .json({ message: "Unauthorized", error: err.message });
  }
};

const permit =
  (...allowedRoles) =>
  (req, res, next) => {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });
    if (allowedRoles.includes(req.user.role)) return next();
    return res.status(403).json({ message: "Forbidden" });
  };

module.exports = { auth, permit };
