import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
// Initialize axios interceptors (handles token refresh on 401)
import "./utils/axiosSetup";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { Toaster } from "react-hot-toast";
import { SocketProvider } from "./context/LocationProvider.jsx";
import { LanguageProvider } from "./context/LanguageContext.jsx";

createRoot(document.getElementById("root")).render(
  <SocketProvider>
    <LanguageProvider>
      <Toaster />
      <App />
    </LanguageProvider>
  </SocketProvider>
);
