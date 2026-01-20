import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/

// for Production
export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: "/flight-demo",
});

// for development
// export default defineConfig({
//   plugins: [react(), tailwindcss()],
//   base: "/",
// });
