// When running inside Docker the host machine is reachable via host.docker.internal
const VROOM_HOST = process.env.VROOM_HOST || process.env.VROOM_URL || "http://host.docker.internal:3000";

/**
 * Send an optimization request to the VROOM engine.
 * @param {object} vroomPayload - Full VROOM-formatted request body
 * @returns {Promise<object>} VROOM optimization result
 */
export async function solveVroom(vroomPayload) {
  const response = await fetch(VROOM_HOST, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(vroomPayload),
  });

  if (!response.ok) {
    const text = await response.text();
    const err = new Error(`VROOM error: ${text}`);
    err.status = response.status;
    throw err;
  }

  return response.json();
}
