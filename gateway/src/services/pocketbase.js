import PocketBase from "pocketbase";

let pb = null;

/**
 * Returns a singleton PocketBase instance.
 */
export function getPocketBase() {
  if (!pb) {
    const url = process.env.POCKETBASE_URL || "http://localhost:8090";
    pb = new PocketBase(url);
    pb.autoCancellation(false);
  }
  return pb;
}
