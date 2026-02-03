import { z } from "zod";

/**
 * Validation schemas for API endpoints
 */
export const schemas = {
  // Task schemas
  createTask: z.object({
    type: z.enum(["service", "delivery"]),
    address: z.string().min(1).max(500),
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
    customer_name: z.string().min(1).max(200).optional(),
    customer_phone: z.string().max(50).optional(),
    notes: z.string().max(1000).optional(),
    priority: z.enum(["low", "medium", "high"]).default("medium"),
    service_duration: z.number().min(0).max(480).optional(), // max 8 hours
    pickup_address: z.string().max(500).optional(),
    pickup_latitude: z.number().min(-90).max(90).optional(),
    pickup_longitude: z.number().min(-180).max(180).optional(),
  }),

  updateTask: z.object({
    status: z.enum(["pending", "optimized", "assigned", "in_progress", "completed", "cancelled"]).optional(),
    staff_id: z.string().optional(),
    sort_order: z.number().min(0).optional(),
    notes: z.string().max(1000).optional(),
  }),

  // Query parameter validation
  listTasks: z.object({
    page: z.coerce.number().int().min(1).max(1000).default(1),
    perPage: z.coerce.number().int().min(1).max(100).default(50),
    status: z.enum(["pending", "optimized", "assigned", "in_progress", "completed", "cancelled"]).optional(),
    type: z.enum(["service", "delivery"]).optional(),
  }),

  // ID parameter validation
  taskId: z.string().min(15).max(15).regex(/^[a-z0-9]+$/),
};

/**
 * Middleware factory to validate request data against a Zod schema
 * @param {object} schemaMap - Map of locations to schemas, e.g., { body: schemas.createTask }
 */
export function validate(schemaMap) {
  return (req, res, next) => {
    try {
      // Validate each part of the request
      for (const [location, schema] of Object.entries(schemaMap)) {
        if (location === "params") {
          // Validate URL parameters
          const result = schema.safeParse(req.params);
          if (!result.success) {
            return res.status(400).json({
              error: "Invalid parameters",
              details: result.error.errors.map(e => ({
                field: e.path.join("."),
                message: e.message,
              })),
            });
          }
          req.params = result.data;
        } else if (location === "query") {
          // Validate query parameters
          const result = schema.safeParse(req.query);
          if (!result.success) {
            return res.status(400).json({
              error: "Invalid query parameters",
              details: result.error.errors.map(e => ({
                field: e.path.join("."),
                message: e.message,
              })),
            });
          }
          req.query = result.data;
        } else if (location === "body") {
          // Validate request body
          const result = schema.safeParse(req.body);
          if (!result.success) {
            return res.status(400).json({
              error: "Invalid request body",
              details: result.error.errors.map(e => ({
                field: e.path.join("."),
                message: e.message,
              })),
            });
          }
          req.body = result.data;
        }
      }
      next();
    } catch (error) {
      next(error);
    }
  };
}

/**
 * Sanitize filter strings to prevent injection attacks
 * @param {string} value - The value to sanitize
 * @returns {string} - Sanitized value
 */
export function sanitizeFilter(value) {
  if (typeof value !== "string") return value;
  // Escape special characters that could be used for injection
  return value.replace(/["'\\]/g, "\\$&");
}
