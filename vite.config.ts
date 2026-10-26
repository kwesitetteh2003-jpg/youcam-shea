import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
// Dev ports: web 9300, API 9301, preview 9302.
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: { port: 9300, host: "127.0.0.1", strictPort: true, proxy: { "/api": { target: "http://127.0.0.1:9301", changeOrigin: true } } },
  preview: { port: 9302, host: "127.0.0.1", strictPort: true, proxy: { "/api": { target: "http://127.0.0.1:9301", changeOrigin: true } } },
});
