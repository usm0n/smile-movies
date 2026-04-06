import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) return;

          if (
            id.includes("/react/") ||
            id.includes("/react-dom/") ||
            id.includes("/react-router-dom/")
          ) {
            return "react-vendor";
          }

          if (
            id.includes("/@mui/") ||
            id.includes("/@emotion/")
          ) {
            return "mui-vendor";
          }

          if (
            id.includes("/swiper/") ||
            id.includes("/keen-slider/")
          ) {
            return "media-vendor";
          }

          if (
            id.includes("/axios/") ||
            id.includes("/react-hot-toast/") ||
            id.includes("/react-helmet/") ||
            id.includes("/@react-oauth/")
          ) {
            return "app-vendor";
          }
        },
      },
    },
  },
});
