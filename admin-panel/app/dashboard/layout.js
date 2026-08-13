"use client";

import { Sidebar } from "../components/sidebar";
import { Navbar } from "../components/navbar";
import { useState, useEffect } from "react";

export default function DashboardLayout({ children }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Handle mobile responsiveness
  useEffect(() => {
    const handleResize = () => {
      const isMobileScreen = window.innerWidth < 768;
      setIsMobile(isMobileScreen);
      if (isMobileScreen) setIsCollapsed(true);
    };

    handleResize(); // Initial run
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const getMarginLeft = () => {
    if (isMobile) return "ml-0";
    return isCollapsed ? "ml-[80px]" : "ml-[250px]";
  };

  return (
    <div className="min-h-screen flex bg-gray-100">
      {/* Toast Notification */}
      

      {/* Sidebar */}
      {(!isMobile || !isCollapsed) && (
        <Sidebar
          isCollapsed={isCollapsed}
          setIsCollapsed={setIsCollapsed}
          isMobile={isMobile}
        />
      )}

      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Navbar */}
        <Navbar
          isCollapsed={isCollapsed}
          setIsCollapsed={setIsCollapsed}
          isMobile={isMobile}
        />

        {/* Main Content */}
        <main
          className={`transition-all duration-300 ease-in-out p-4 md:p-6 ${getMarginLeft()}`}
        >
          <div className="max-w-screen-2xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}
