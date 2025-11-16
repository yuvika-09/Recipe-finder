const jwt = require("jsonwebtoken");
const SECRET_KEY = 'mysecretkey';  // must match auth service

module.exports = function (req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({ message: "No token provided" });
    }

    const token = authHeader.split(" ")[1]; 
    // Expected format: "Bearer <token>"

    if (!token) {
        return res.status(401).json({ message: "Token missing" });
    }

    try {
        const decoded = jwt.verify(token, SECRET_KEY); // <-- FIXED HERE
        req.user = decoded; // attach user info
        next();
    } catch (error) {
        return res.status(401).json({ message: "Invalid token" });
    }
};
