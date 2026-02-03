import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import { optimizeRoutes } from "./routes/optimize.js";
import { tasksRouter } from "./routes/tasks.js";
import { staffRouter } from "./routes/staff.js";
import { healthRouter } from "./routes/health.js";
import adminRouter from "./routes/admin.js";
import { authMiddleware } from "./middleware/auth.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { apiLimiter } from "./middleware/rateLimiter.js";
import { statisticsTracker } from "./middleware/statisticsTracker.js";
import logger, { requestLogger } from "./utils/logger.js";

const app = express();
const PORT = process.env.GATEWAY_PORT || 4000;

// ─── Security Middleware ──────────────────────────────
// Enhanced Helmet configuration with CSP and other security headers
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"], // For inline styles if needed
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'"],
        fontSrc: ["'self'"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'none'"],
      },
    },
    crossOriginEmbedderPolicy: true,
    crossOriginOpenerPolicy: true,
    crossOriginResourcePolicy: { policy: "same-site" },
    dnsPrefetchControl: true,
    frameguard: { action: "deny" },
    hidePoweredBy: true,
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true,
    },
    ieNoOpen: true,
    noSniff: true,
    referrerPolicy: { policy: "strict-origin-when-cross-origin" },
    xssFilter: true,
  })
);

// CORS configuration
app.use(
  cors({
    origin: process.env.GATEWAY_CORS_ORIGINS?.split(",") || "*",
    credentials: true,
    methods: ["GET", "POST", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization", "x-api-key"],
  })
);

// Logging - using custom Winston logger
app.use(requestLogger);

// Body parsing with size limit
app.use(express.json({ limit: "100kb" })); // Reduced from 1mb for security

// Trust proxy (needed for rate limiting behind reverse proxy)
app.set("trust proxy", 1);

// Statistics tracking for all requests
app.use(statisticsTracker);

// ─── Public Routes ────────────────────────────────────
app.use("/health", healthRouter);

// ─── Admin Routes ─────────────────────────────────────
app.use("/admin", adminRouter);

// ─── Protected Routes with Rate Limiting ──────────────
app.use("/api", apiLimiter); // Apply general rate limiting to all API routes
app.use("/api", authMiddleware); // Then authenticate
app.use("/api/tasks", tasksRouter);
app.use("/api/staff", staffRouter);
app.use("/api/optimize", optimizeRoutes);

// ─── Error Handler ────────────────────────────────────
app.use(errorHandler);

app.listen(PORT, () => {
  logger.info(`Gateway started on http://localhost:${PORT}`, {
    environment: process.env.NODE_ENV || "development",
    corsOrigins: process.env.GATEWAY_CORS_ORIGINS || "*",
    port: PORT,
  });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, closing server gracefully');
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, closing server gracefully');
  process.exit(0);
});

export default app;
