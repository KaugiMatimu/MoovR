import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    chunkSizeWarningLimit: 1000, // Increase warning limit to 1000KB
  },
  // server: {
  //   proxy: {
  //     "/api": {
  //       target: "https://moovr-api.vercel.app",
  //       changeOrigin: true,
  //       secure: false,
  //     },
  //   },
  // },
});
