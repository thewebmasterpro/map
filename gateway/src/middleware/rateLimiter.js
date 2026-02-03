import rateLimit from "express-rate-limit";

/**
 * General API rate limiter
 * Limits each IP to 100 requests per 15 minutes
 */
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    error: "Too many requests from this IP, please try again later.",
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  // Skip successful requests to only count failed/suspicious ones
  skipSuccessfulRequests: false,
});

/**
 * Strict rate limiter for authentication endpoints
 * Limits each IP to 5 requests per 15 minutes
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 login attempts per windowMs
  message: {
    error: "Too many authentication attempts, please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Don't count successful auth attempts
});

/**
 * Rate limiter for resource creation (POST requests)
 * Limits each IP to 30 requests per 15 minutes
 */
export const createLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // Limit each IP to 30 create requests per windowMs
  message: {
    error: "Too many resources created, please slow down.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Rate limiter for expensive operations (like optimization)
 * Limits each IP to 10 requests per 15 minutes
 */
export const expensiveLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 expensive operations per windowMs
  message: {
    error: "Too many optimization requests, please wait before trying again.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});
