const jwt = require("jsonwebtoken");

// authMiddleware.js
const isLoggedIn = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Unauthorized: No token provided" });
    }
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    req.user = decoded;
    next();
  } catch (err) {
    console.log("JWT VERIFY ERROR:", err);
    return res.status(401).json({ error: "Unauthorized: Invalid token" });
  }
};

module.exports = { isLoggedIn };
