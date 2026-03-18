import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import fs from "fs";
import path from "path";

const DATA_DIR = path.resolve(__dirname, "data");
const DATA_FILE = path.join(DATA_DIR, "csa-systems.json");

function fileApiPlugin() {
  return {
    name: "csa-file-api",
    configureServer(server) {
      server.middlewares.use((req, res, next) => {

        // GET /api/load — read CSA data
        if (req.method === "GET" && req.url === "/api/load") {
          if (fs.existsSync(DATA_FILE)) {
            res.setHeader("Content-Type", "application/json");
            res.end(fs.readFileSync(DATA_FILE, "utf-8"));
          } else {
            res.setHeader("Content-Type", "application/json");
            res.end("null");
          }
          return;
        }

        // POST /api/save — write CSA data
        if (req.method === "POST" && req.url === "/api/save") {
          let body = "";
          req.on("data", chunk => { body += chunk; });
          req.on("end", () => {
            if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
            fs.writeFileSync(DATA_FILE, body);
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ ok: true }));
          });
          return;
        }

        next();
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), fileApiPlugin()],
  server: {
    port: 5177,
    host: "127.0.0.1",
    open: false,
  },
});
