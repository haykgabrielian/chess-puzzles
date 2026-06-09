import react from "@vitejs/plugin-react";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { defineConfig, type Plugin } from "vite";

const projectRoot = path.dirname(fileURLToPath(import.meta.url));
const puzzleDir = path.resolve(projectRoot, "puzzle");

const servePuzzleFiles = (): Plugin => {
  const handleRequest = (
    req: { url?: string },
    res: {
      statusCode: number;
      setHeader: (name: string, value: string) => void;
      end: (body?: string) => void;
    },
    next: () => void,
  ) => {
    if (!req.url?.startsWith("/puzzle/")) {
      next();
      return;
    }

    const relativePath = decodeURIComponent(req.url.slice("/puzzle/".length));
    const filePath = path.resolve(puzzleDir, relativePath);

    if (
      !filePath.startsWith(puzzleDir) ||
      !fs.existsSync(filePath) ||
      !fs.statSync(filePath).isFile()
    ) {
      res.statusCode = 404;
      res.end("Not found");
      return;
    }

    res.setHeader("Content-Type", "application/json");
    fs.createReadStream(filePath).pipe(res as NodeJS.WritableStream);
  };

  return {
    name: "serve-puzzle-files",
    configureServer(server) {
      server.middlewares.use(handleRequest);
    },
    configurePreviewServer(server) {
      server.middlewares.use(handleRequest);
    },
    closeBundle() {
      fs.cpSync(puzzleDir, path.resolve(projectRoot, "dist/puzzle"), {
        recursive: true,
      });
    },
  };
};

export default defineConfig({
  plugins: [react(), servePuzzleFiles()],

  resolve: {
    alias: {
      "@": path.resolve(projectRoot, "./src"),
    },
  },

  server: {
    port: 5173,
  },
});
