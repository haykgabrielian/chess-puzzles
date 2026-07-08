import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "url";
import { defineConfig, loadEnv } from "vite";

const projectRoot = path.dirname(fileURLToPath(import.meta.url));
const defaultApiUrl = "http://localhost:3001";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, projectRoot, "");
  const apiUrl = env.VITE_API_URL || defaultApiUrl;

  return {
    plugins: [react()],

    resolve: {
      alias: {
        "@": path.resolve(projectRoot, "./src"),
      },
    },

    server: {
      port: 5173,
      proxy: {
        "/api": {
          target: apiUrl,
          changeOrigin: true,
        },
      },
    },
  };
});
