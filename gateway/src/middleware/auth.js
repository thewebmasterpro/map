import { getPocketBase } from "../services/pocketbase.js";

/**
 * Middleware: Validate API key from x-api-key header.
 * Attaches client record to req.client on success.
 */
export async function authMiddleware(req, res, next) {
  const apiKey = req.headers["x-api-key"];

  if (!apiKey) {
    return res.status(401).json({ error: "Missing x-api-key header" });
  }

  try {
    const pb = getPocketBase();
    const client = await pb
      .collection("clients")
      .getFirstListItem(`api_key="${apiKey}" && is_active=true`);

    if (!client) {
      return res.status(403).json({ error: "Invalid or inactive API key" });
    }

    // CORS origin check
    const origin = req.headers.origin;
    if (client.allowed_origins && client.allowed_origins.length > 0 && origin) {
      if (!client.allowed_origins.includes(origin)) {
        return res.status(403).json({ error: "Origin not allowed for this API key" });
      }
    }

    req.client = client;
    next();
  } catch (err) {
    if (err.status === 404) {
      return res.status(403).json({ error: "Invalid API key" });
    }
    next(err);
  }
}
