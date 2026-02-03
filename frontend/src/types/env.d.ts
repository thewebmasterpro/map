/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_POCKETBASE_URL: string;
  readonly VITE_MAP_TILE_URL: string;
  readonly VITE_API_KEY: string;
  readonly VITE_OSRM_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
