"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Image from 'next/image';

import {
  LayoutDashboard,
  Users,
  Car,
  FileCheck,
  History,
  LogOut,
  ChevronLeft,
  ChevronRight,
  CarFrontIcon,
  SettingsIcon,
  X,
  Menu,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const menuItems = [
  {
    title: "MAIN",
    items: [{ title: "Dashboard", icon: LayoutDashboard, href: "/dashboard" }],
  },
  {
    title: "BOOKING MANAGEMENT",
    items: [{ title: "Booking History", icon: History, href: "/dashboard/bookings" }],
  },
  {
    title: "CUSTOMER MANAGEMENT",
    items: [{ title: "Passengers", icon: Users, href: "/dashboard/passengers" }],
  },
  {
    title: "DRIVER MANAGEMENT",
    items: [
      { title: "Drivers", icon: Car, href: "/dashboard/drivers" },
      { title: "Verify Drivers", icon: FileCheck, href: "/dashboard/verify-drivers" },
    ],
  },
  {
    title: "FINANCE MANAGEMENT",
    items: [
      { title: "Wallet", icon: CarFrontIcon, href: "/dashboard/wallet" },
      { title: "Payouts", icon: SettingsIcon, href: "/dashboard/payouts" },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/");
  };

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) {
        setIsCollapsed(true);
        setMobileOpen(false);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);


  /// get the data from the backend and then display here 
  

  const SidebarContent = (
    <>
      {/* Logo */}
      <div className="p-4 border-b border-gray-700 flex items-center justify-between">
        <img
          src="/logo.png"
          alt="Logo"
          className={cn("transition-all duration-300", isCollapsed ? "w-8" : "w-32")}
        />
        {isMobile && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileOpen(false)}
            className="ml-auto"
          >
            <X className="text-white h-5 w-5" />
          </Button>
        )}
      </div>

      {/* Scrollable Menu */}
      <div className="flex-1 overflow-y-auto no-scrollbar py-4">
        <div className="flex flex-col gap-4">
          {menuItems.map((section, idx) => (
            <div key={idx}>
              {!isCollapsed && (
                <div className="px-4 py-1">
                  <p className="text-xs font-semibold text-gray-400 tracking-wide uppercase">
                    {section.title}
                  </p>
                </div>
              )}
              {section.items.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link key={item.href} href={item.href}>
                    <span
                      className={cn(
                        "flex items-center gap-3 px-4 py-2 mx-2 rounded-lg text-sm font-medium transition-colors cursor-pointer",
                        isActive
                          ? "bg-purple-500 text-white"
                          : "text-gray-400 hover:bg-gray-800 hover:text-white",
                        isCollapsed && "justify-center"
                      )}
                    >
                      <item.icon size={20} />
                      {!isCollapsed && <span>{item.title}</span>}
                    </span>
                  </Link>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Logout */}
      <div className="px-4 py-2 border-t border-gray-700">
        <button 
          onClick={handleLogout}
          className="w-full text-left"
        >
          <span
            className={cn(
              "flex items-center gap-3 px-4 py-2 mx-2 rounded-lg text-sm font-medium text-purple-400 hover:bg-red-500/10 transition-colors cursor-pointer",
              isCollapsed && "justify-center"
            )}
          >
            <LogOut size={20} />
            {!isCollapsed && <span>Log out</span>}
          </span>
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <aside
          className={cn(
            "fixed top-0 left-0 h-screen bg-[#1a1c23] text-white shadow-lg transition-all duration-300 ease-in-out flex flex-col",
            isCollapsed ? "w-[80px]" : "w-[250px]"
          )}
        >
          {SidebarContent}
        </aside>

        {/* Collapse Toggle */}
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "absolute top-6 z-50 h-7 w-7 rounded-full border bg-white text-gray-600 shadow-md hover:bg-gray-100 transition-all duration-300",
            isCollapsed ? "left-[60px]" : "left-[230px]"
          )}
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      {/* Mobile Sidebar */}
      {isMobile && mobileOpen && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50">
          <aside className="w-[250px] h-full bg-[#1a1c23] shadow-xl flex flex-col">
            {SidebarContent}
          </aside>
        </div>
      )}

      {/* Mobile Menu Button */}
      {isMobile && !mobileOpen && (
        <Button
          variant="ghost"
          size="icon"
          className="fixed top-4 left-4 z-50 bg-white text-gray-600 shadow"
          onClick={() => setMobileOpen(true)}
        >
          <Menu className="h-5 w-5" />
        </Button>
      )}
    </>
  );
}
