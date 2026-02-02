import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { optimizeRoutes } from "./routes/optimize.js";
import { tasksRouter } from "./routes/tasks.js";
import { staffRouter } from "./routes/staff.js";
import { healthRouter } from "./routes/health.js";
import { authMiddleware } from "./middleware/auth.js";
import { errorHandler } from "./middleware/errorHandler.js";

const app = express();
const PORT = process.env.GATEWAY_PORT || 4000;

// ─── Global Middleware ────────────────────────────────
app.use(helmet());
app.use(
  cors({
    origin: process.env.GATEWAY_CORS_ORIGINS?.split(",") || "*",
    credentials: true,
  })
);
app.use(morgan("short"));
app.use(express.json({ limit: "1mb" }));

// ─── Public Routes ────────────────────────────────────
app.use("/health", healthRouter);

// ─── Protected Routes ─────────────────────────────────
app.use("/api", authMiddleware);
app.use("/api/tasks", tasksRouter);
app.use("/api/staff", staffRouter);
app.use("/api/optimize", optimizeRoutes);

// ─── Error Handler ────────────────────────────────────
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`[Gateway] Running on http://localhost:${PORT}`);
});

export default app;
