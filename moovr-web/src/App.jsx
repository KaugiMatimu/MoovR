import React from "react";
import Router from "./router/router";
import ErrorBoundary from "./components/ErrorBoundary";

const App = () => {
  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-white text-black dark:bg-gray-900 dark:text-white transition-colors">
        <Router />
        {/* Global reCAPTCHA container - Fixed at bottom to prevent layout shifts */}
        <div className="fixed bottom-4 left-0 right-0 flex justify-center z-[9999] pointer-events-none">
          <div id="recaptcha-container" className="pointer-events-auto shadow-2xl rounded-lg"></div>
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default App;
