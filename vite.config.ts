import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: [
      'smile-movies.uz',
      'www.smile-movies.uz'
    ],
  }
});
