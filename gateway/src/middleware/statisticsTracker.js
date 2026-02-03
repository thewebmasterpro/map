import statisticsService from "../services/statistics.js";

/**
 * Middleware to track API statistics
 * Records API calls, response times, and errors
 */
export function statisticsTracker(req, res, next) {
  const startTime = Date.now();

  // Capture original response methods
  const originalJson = res.json;
  const originalSend = res.send;

  // Track when response is sent
  const trackResponse = () => {
    const responseTime = Date.now() - startTime;
    const endpoint = req.route?.path || req.path;
    const clientId = req.client?.id || "unknown";

    // Record response time
    statisticsService.recordResponseTime(endpoint, responseTime);

    // Record API call
    if (req.client) {
      statisticsService.recordApiCall(clientId, endpoint, req.method);
    }

    // If this was an optimization request, track it
    if (endpoint.includes("/optimize")) {
      const success = res.statusCode >= 200 && res.statusCode < 300;
      statisticsService.recordOptimization(clientId, responseTime, success);
    }

    // Track errors
    if (res.statusCode >= 400) {
      const errorType =
        res.statusCode >= 500 ? "server_error" : "client_error";

      statisticsService.recordError(
        errorType,
        {
          statusCode: res.statusCode,
          endpoint,
          method: req.method,
        },
        clientId
      );
    }
  };

  // Override res.json
  res.json = function (data) {
    trackResponse();
    return originalJson.call(this, data);
  };

  // Override res.send
  res.send = function (data) {
    trackResponse();
    return originalSend.call(this, data);
  };

  next();
}
