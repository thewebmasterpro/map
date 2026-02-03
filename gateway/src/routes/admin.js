import express from "express";
import { adminAuthMiddleware, adminLogin } from "../middleware/adminAuth.js";
import statisticsService from "../services/statistics.js";
import logger from "../utils/logger.js";

const router = express.Router();

/**
 * POST /admin/login
 * Admin login endpoint
 */
router.post("/login", adminLogin);

/**
 * GET /admin/stats
 * Get all statistics
 */
router.get("/stats", adminAuthMiddleware, (req, res) => {
  try {
    const stats = statisticsService.getStats();
    res.json(stats);
  } catch (error) {
    logger.error("Error fetching stats", { error: error.message });
    res.status(500).json({ error: "Failed to fetch statistics" });
  }
});

/**
 * GET /admin/summary
 * Get summary statistics
 */
router.get("/summary", adminAuthMiddleware, (req, res) => {
  try {
    const summary = statisticsService.getSummary();
    res.json(summary);
  } catch (error) {
    logger.error("Error fetching summary", { error: error.message });
    res.status(500).json({ error: "Failed to fetch summary" });
  }
});

/**
 * GET /admin/clients
 * Get client statistics
 */
router.get("/clients", adminAuthMiddleware, (req, res) => {
  try {
    const clients = statisticsService.getClientStats();
    res.json({ clients });
  } catch (error) {
    logger.error("Error fetching client stats", { error: error.message });
    res.status(500).json({ error: "Failed to fetch client statistics" });
  }
});

/**
 * GET /admin/activity
 * Get recent activity logs
 */
router.get("/activity", adminAuthMiddleware, (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const activity = statisticsService.getActivityLogs(limit);
    res.json({ activity });
  } catch (error) {
    logger.error("Error fetching activity", { error: error.message });
    res.status(500).json({ error: "Failed to fetch activity logs" });
  }
});

/**
 * GET /admin/usage-over-time
 * Get usage over time (last 30 days)
 */
router.get("/usage-over-time", adminAuthMiddleware, (req, res) => {
  try {
    const usage = statisticsService.getUsageOverTime();
    res.json({ usage });
  } catch (error) {
    logger.error("Error fetching usage over time", { error: error.message });
    res.status(500).json({ error: "Failed to fetch usage data" });
  }
});

/**
 * POST /admin/reset-stats
 * Reset all statistics (dangerous operation)
 */
router.post("/reset-stats", adminAuthMiddleware, (req, res) => {
  try {
    statisticsService.reset();
    logger.warn("Statistics reset by admin", {
      admin: req.admin.email,
      ip: req.ip,
    });
    res.json({ success: true, message: "Statistics reset successfully" });
  } catch (error) {
    logger.error("Error resetting stats", { error: error.message });
    res.status(500).json({ error: "Failed to reset statistics" });
  }
});

export default router;
