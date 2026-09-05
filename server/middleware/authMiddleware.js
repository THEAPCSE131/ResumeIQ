const jwt = require("jsonwebtoken");

const protect = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.split(" ")[1];
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded.id; // Attach user ID to request object
      next();
    } catch (error) {
      return res.status(401).json({ success: false, message: "Invalid token." });
    }
  } else {
    return res.status(401).json({ success: false, message: "Authentication is required." });
  }
};

module.exports = { protect };
