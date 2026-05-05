import { defineConfig } from "vite";
import path from "path";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: "./",
  server: {
    port: 3000,
  },
  resolve: {
    alias: {
      "@server": path.resolve(__dirname, "../server/src"),
    },
  },
});
