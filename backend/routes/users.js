const express = require("express");
const { auth, permit } = require("../middleware/auth");
const User = require("../models/User");
const router = express.Router();

router.get("/", auth, permit("SUPER_USER", "ADMIN"), async (req, res) => {
  const users = await User.find().select("_id name email role");
  res.json(users);
});

module.exports = router;
