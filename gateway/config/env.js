import { z } from "zod";

/**
 * Environment variable validation schema
 */
const envSchema = z.object({
  // Server
  GATEWAY_PORT: z.coerce.number().int().min(1).max(65535).default(4000),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),

  // PocketBase
  POCKETBASE_URL: z.string().url(),
  POCKETBASE_ADMIN_EMAIL: z.string().email().optional(),
  POCKETBASE_ADMIN_PASSWORD: z.string().min(8).optional(),

  // CORS
  GATEWAY_CORS_ORIGINS: z.string().default("*"),

  // JWT
  JWT_SECRET: z.string().min(32, "JWT_SECRET must be at least 32 characters"),

  // VROOM/OSRM
  VROOM_HOST: z.string().url().optional(),
  OSRM_HOST: z.string().url().optional(),
});

/**
 * Validate and return typed environment variables
 * @throws {Error} If validation fails
 * @returns {z.infer<typeof envSchema>} Validated environment variables
 */
export function validateEnv() {
  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    console.error("❌ Invalid environment variables:");
    result.error.errors.forEach((err) => {
      console.error(`  - ${err.path.join(".")}: ${err.message}`);
    });
    throw new Error("Environment validation failed. Please check your .env file.");
  }

  return result.data;
}

/**
 * Get validated environment variables
 * Call this at startup to ensure all required env vars are present
 */
export const env = validateEnv();
