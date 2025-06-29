const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const router = express.Router();

// Middleware to check JWT
const authMiddleware = async (req, res, next) => {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ message: "Not authenticated" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) return res.status(401).json({ message: "User not found" });
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
};

// Profile route
router.get("/profile", authMiddleware, (req, res) => {
  const { name, email, avatar } = req.user;
  res.json({ user: { name, email, avatar } });
});


// Logout user by clearing the cookie
router.post("/logout", (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: false,   // use true in production with HTTPS
    sameSite: "Lax",
  });
  res.json({ message: "Logged out successfully" });
});



module.exports = router;
