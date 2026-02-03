/**
 * Frontend environment variable validation and type-safe access
 */

interface EnvironmentVariables {
  VITE_API_URL: string;
  VITE_POCKETBASE_URL: string;
  VITE_MAP_TILE_URL: string;
  VITE_API_KEY: string;
  VITE_OSRM_URL?: string;
}

/**
 * Validate that all required environment variables are present
 * @throws {Error} If any required variable is missing
 */
function validateEnv(): EnvironmentVariables {
  const required = [
    "VITE_API_URL",
    "VITE_POCKETBASE_URL",
    "VITE_MAP_TILE_URL",
    "VITE_API_KEY",
  ] as const;

  const missing: string[] = [];

  for (const key of required) {
    if (!import.meta.env[key]) {
      missing.push(key);
    }
  }

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(", ")}\n` +
        "Please check your .env.local file."
    );
  }

  // Validate URL formats
  try {
    new URL(import.meta.env.VITE_API_URL);
    new URL(import.meta.env.VITE_POCKETBASE_URL);
  } catch (error) {
    throw new Error(
      "Invalid URL format in environment variables. " +
        "Please ensure VITE_API_URL and VITE_POCKETBASE_URL are valid URLs."
    );
  }

  return {
    VITE_API_URL: import.meta.env.VITE_API_URL,
    VITE_POCKETBASE_URL: import.meta.env.VITE_POCKETBASE_URL,
    VITE_MAP_TILE_URL: import.meta.env.VITE_MAP_TILE_URL,
    VITE_API_KEY: import.meta.env.VITE_API_KEY,
    VITE_OSRM_URL: import.meta.env.VITE_OSRM_URL,
  };
}

/**
 * Type-safe, validated environment variables
 * Use this instead of import.meta.env directly
 */
export const env = validateEnv();

/**
 * Check if running in development mode
 */
export const isDevelopment = import.meta.env.DEV;

/**
 * Check if running in production mode
 */
export const isProduction = import.meta.env.PROD;
