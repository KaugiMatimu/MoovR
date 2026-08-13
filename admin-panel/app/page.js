"use client";

import { Card, CardBody, CardHeader } from "@nextui-org/card";
import { Input } from "@nextui-org/input";
import { Button } from "@nextui-org/button";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Eye, EyeOff } from "lucide-react";
import Image from "next/image"; // ✅ Correct import
import axios from "axios";
import { BaseURL } from "@/utils/baseURL";

export default function LoginPage() {
  const router = useRouter();

  const [credentials, setCredentials] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();

    const { email, password } = credentials;

    if (!email || !password) {
      toast.error("All fields are required");
      return;
    }

    try {
      const response = await axios.post(`${BaseURL}/auth/admin-login`, {
        email,
        password,
      });

      if (response.data.token) {
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("user", JSON.stringify(response.data.user));
        toast.success("Login successful!");
        router.push("/dashboard");
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error(error.response?.data?.message || "Invalid credentials");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-100 to-orange-50 px-4">
      <Card className="w-full max-w-md shadow-lg border border-orange-200">
        <CardHeader className="flex flex-col items-center gap-2 p-6">
          <Image
            src="/logo.png" // ✅ Must be inside /public
            alt="Logo"
            width={40}
            height={40}
            className="h-10 w-auto"
          />
          <h1 className="text-2xl font-semibold text-orange-700">
            Admin Login
          </h1>
        </CardHeader>

        <CardBody>
          <form onSubmit={handleLogin} className="flex flex-col gap-5">
            <Input
              type="email"
              placeholder="Enter your email"
              value={credentials.email}
              onChange={(e) =>
                setCredentials({ ...credentials, email: e.target.value })
              }
            />
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              value={credentials.password}
              onChange={(e) =>
                setCredentials({ ...credentials, password: e.target.value })
              }
              endContent={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="focus:outline-none"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5 text-gray-500" />
                  ) : (
                    <Eye className="w-5 h-5 text-gray-500" />
                  )}
                </button>
              }
            />
            <Button type="submit" color="primary" fullWidth>
              Login
            </Button>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}
