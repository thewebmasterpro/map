import { log } from "../utils/logger.js";

/**
 * Global error handler middleware.
 * Sanitizes errors to prevent information leakage in production.
 */
export function errorHandler(err, req, res, _next) {
  const isDevelopment = process.env.NODE_ENV === "development";
  const status = err.status || 500;

  // Log error with appropriate level
  const logData = {
    message: err.message,
    status,
    url: req.url,
    method: req.method,
    timestamp: new Date().toISOString(),
  };

  // Include stack trace only in development
  if (isDevelopment) {
    logData.stack = err.stack;
    logData.data = err.data;
  }

  // Log with appropriate level based on status
  if (status >= 500) {
    log.error("Request error", logData);
  } else if (status >= 400) {
    log.warn("Client error", logData);
  } else {
    log.info("Request completed with error", logData);
  }

  // Build sanitized error response
  const errorResponse = {
    error: sanitizeErrorMessage(err, status),
  };

  // Only include additional details in development
  if (isDevelopment && err.data) {
    errorResponse.details = err.data;
  }

  // Add request ID if available (for error tracking)
  if (req.id) {
    errorResponse.requestId = req.id;
  }

  res.status(status).json(errorResponse);
}

/**
 * Sanitize error messages to prevent information leakage
 * @param {Error} err - The error object
 * @param {number} status - HTTP status code
 * @returns {string} - Sanitized error message
 */
function sanitizeErrorMessage(err, status) {
  // For 500 errors, never expose internal error messages
  if (status === 500) {
    return "Internal server error. Please try again later.";
  }

  // For 4xx errors, allow the error message but sanitize it
  const message = err.message || "An error occurred";

  // Remove any potential sensitive information patterns
  const sanitized = message
    .replace(/password[^,}\s]*/gi, "password=***") // Hide passwords
    .replace(/token[^,}\s]*/gi, "token=***") // Hide tokens
    .replace(/api[_-]?key[^,}\s]*/gi, "api_key=***") // Hide API keys
    .replace(/secret[^,}\s]*/gi, "secret=***") // Hide secrets
    .replace(/\/[a-z]:[\\\/].*/gi, "[PATH]") // Hide file paths (Windows)
    .replace(/\/(?:home|usr|var|etc)[\\\/].*/gi, "[PATH]"); // Hide file paths (Unix)

  return sanitized;
}
