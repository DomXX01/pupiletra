import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "/pupiletra-michi/", // 👈 pon el nombre del repo
});
