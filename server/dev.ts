// Local API server for development (Vite proxies /api here). Reads YOUCAM_API_KEY from .env if present.
import http from "node:http";
import fs from "node:fs";
if (fs.existsSync(".env")) for (const l of fs.readFileSync(".env", "utf8").split("\n")) { const m = /^\s*([A-Z_]+)\s*=\s*(.*)\s*$/.exec(l); if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, ""); }
const { createHandler, readConfig } = await import("./core");
const cfg = readConfig(); const port = Number(process.env.API_PORT || 9301);
http.createServer(createHandler(cfg)).listen(port, "127.0.0.1", () => console.log(`shea api :${port} (${cfg.mode} mode)`));
