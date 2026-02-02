/**
 * Global error handler middleware.
 */
export function errorHandler(err, req, res, _next) {
  console.error("[Gateway Error Full]", JSON.stringify({
    message: err.message,
    status: err.status,
    data: err.data,
    stack: err.stack
  }, null, 2));

  const status = err.status || 500;
  res.status(status).json({
    error: status === 500 ? "Internal server error" : err.message,
  });
}
