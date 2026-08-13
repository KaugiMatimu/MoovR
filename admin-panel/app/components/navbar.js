"use client"

import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from "@nextui-org/dropdown"
import { Avatar } from "@nextui-org/avatar"
import { Sun } from "lucide-react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

export function Navbar() {
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (e) {
        console.error("Error parsing user data", e);
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/");
  };

  return (
    <nav className="h-16 border-b px-4 flex items-center justify-between bg-white">
      <h1 className="text-xl font-semibold">Moovr Admin</h1>
      <div className="flex items-center gap-4">
        <div className="hidden md:block text-right">
          <p className="text-sm font-medium">{user ? `${user.firstName} ${user.lastName}` : "Admin User"}</p>
          <p className="text-xs text-gray-500 uppercase">{user?.role || "Administrator"}</p>
        </div>
        <button className="p-2 hover:bg-gray-100 rounded-lg">
          <Sun size={20} />
        </button>
        <Dropdown>
          <DropdownTrigger>
            <Avatar 
              src={user?.profilePicture || "/placeholder.svg"} 
              size="sm" 
              className="cursor-pointer border border-gray-200" 
              name={user ? `${user.firstName?.charAt(0)}${user.lastName?.charAt(0)}` : "A"}
            />
          </DropdownTrigger>
          <DropdownMenu aria-label="User menu">
            <DropdownItem key="profile">Profile Settings</DropdownItem>
            <DropdownItem key="logout" className="text-danger" color="danger" onClick={handleLogout}>
              Log Out
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
      </div>
    </nav>
  )
}

