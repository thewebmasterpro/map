import PocketBase from "pocketbase";

let instance: PocketBase | null = null;

export function getPocketBaseClient(url?: string): PocketBase {
  if (!instance) {
    const baseUrl = url || import.meta.env.VITE_POCKETBASE_URL || "http://localhost:8090";
    instance = new PocketBase(baseUrl);
    instance.autoCancellation(false);
  }
  return instance;
}
