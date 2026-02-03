import jwt from "jsonwebtoken";
import logger from "../utils/logger.js";

/**
 * Admin authentication middleware
 * Validates JWT token for admin access
 */
export function adminAuthMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        error: "Unauthorized",
        message: "Admin authentication required",
      });
    }

    const token = authHeader.substring(7); // Remove "Bearer " prefix

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Check if user has admin role
      if (decoded.role !== "admin") {
        return res.status(403).json({
          error: "Forbidden",
          message: "Admin access required",
        });
      }

      // Attach admin info to request
      req.admin = {
        id: decoded.id,
        email: decoded.email,
        role: decoded.role,
      };

      next();
    } catch (jwtError) {
      logger.warn("Invalid admin JWT token", {
        error: jwtError.message,
        ip: req.ip,
      });

      return res.status(401).json({
        error: "Unauthorized",
        message: "Invalid or expired token",
      });
    }
  } catch (error) {
    logger.error("Admin auth middleware error", {
      error: error.message,
      stack: error.stack,
    });

    return res.status(500).json({
      error: "Internal server error",
    });
  }
}

/**
 * Admin login - generates JWT token
 */
export function adminLogin(req, res) {
  try {
    const { email, password } = req.body;

    // Get admin credentials from environment
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminEmail || !adminPassword) {
      logger.error("Admin credentials not configured in environment");
      return res.status(500).json({
        error: "Server configuration error",
      });
    }

    // Validate credentials
    if (email !== adminEmail || password !== adminPassword) {
      logger.warn("Failed admin login attempt", {
        email,
        ip: req.ip,
      });

      return res.status(401).json({
        error: "Invalid credentials",
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        id: "admin",
        email: adminEmail,
        role: "admin",
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "24h", // Token expires in 24 hours
      }
    );

    logger.info("Admin login successful", {
      email: adminEmail,
      ip: req.ip,
    });

    res.json({
      success: true,
      token,
      expiresIn: 86400, // 24 hours in seconds
    });
  } catch (error) {
    logger.error("Admin login error", {
      error: error.message,
      stack: error.stack,
    });

    res.status(500).json({
      error: "Internal server error",
    });
  }
}
