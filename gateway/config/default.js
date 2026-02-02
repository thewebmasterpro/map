export default {
  gateway: {
    port: parseInt(process.env.GATEWAY_PORT, 10) || 4000,
    corsOrigins: process.env.GATEWAY_CORS_ORIGINS?.split(",") || ["*"],
  },
  pocketbase: {
    url: process.env.POCKETBASE_URL || "http://localhost:8090",
  },
  vroom: {
    host: process.env.VROOM_HOST || "http://localhost:3000",
  },
  osrm: {
    host: process.env.OSRM_HOST || "http://localhost:5000",
  },
};
