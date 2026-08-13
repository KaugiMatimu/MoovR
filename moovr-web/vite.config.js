import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      external: ["react-intl-tel-input"],
      output: {
        manualChunks: (id) => {
          // Vendor chunks
          if (id.includes('node_modules')) {
            // React ecosystem
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router')) {
              return 'react-vendor';
            }
            // UI libraries
            if (id.includes('react-hot-toast') || id.includes('react-international-phone') ||
                id.includes('react-icons') || id.includes('react-datepicker') ||
                id.includes('react-leaflet') || id.includes('leaflet')) {
              return 'ui-vendor';
            }
            // Charts and data visualization
            if (id.includes('chart.js') || id.includes('react-chartjs-2') || id.includes('recharts')) {
              return 'charts-vendor';
            }
            // Utilities
            if (id.includes('axios') || id.includes('js-cookie') || id.includes('date-fns') ||
                id.includes('socket.io')) {
              return 'utils-vendor';
            }
            // Stripe
            if (id.includes('stripe') || id.includes('@stripe')) {
              return 'stripe-vendor';
            }
            // Other large libraries
            return 'vendor';
          }
        }
      }
    },
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
