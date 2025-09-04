import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// 🚨 cambia el nombre del repo aquí 👇
export default defineConfig({
  plugins: [react()],
  base: "/pupiletra-michi/",
});
