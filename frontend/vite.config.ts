import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";
import { visualizer } from "rollup-plugin-visualizer";

export default defineConfig({
  plugins: [
    react(),
    // Bundle analyzer (only in analyze mode)
    visualizer({
      filename: "./dist/stats.html",
      open: false,
      gzipSize: true,
      brotliSize: true,
    }),
  ],
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
    },
  },
  server: {
    port: 5175,
    proxy: {
      "/api": {
        target: "http://localhost:4002",
        changeOrigin: true,
        rewrite: path => path,
      },
    },
  },
  build: {
    // Enable source maps for production debugging
    sourcemap: true,
    // Chunk size warnings at 500kb
    chunkSizeWarningLimit: 500,
    rollupOptions: {
      output: {
        // Manual chunking for better code splitting
        manualChunks: {
          // Vendor chunks
          react: ["react", "react-dom"],
          reactQuery: ["@tanstack/react-query"],
          leaflet: ["leaflet", "react-leaflet"],
          pocketbase: ["pocketbase"],
          // Utility chunks
          utils: ["zod"],
        },
      },
    },
    // Minification options
    minify: "terser",
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.logs in production
        drop_debugger: true,
      },
    },
  },
  // Optimize dependencies
  optimizeDeps: {
    include: ["react", "react-dom", "leaflet", "react-leaflet", "pocketbase"],
  },
});
