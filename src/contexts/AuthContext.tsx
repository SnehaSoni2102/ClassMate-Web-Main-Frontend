
import React, { createContext, useState, useContext, useEffect } from "react";
import { AuthContextType } from "../types/auth";
import { useToast } from "@/components/ui/use-toast";
import { jwtDecode } from "jwt-decode";
import { api } from "@/lib/api/api-interceptor";

interface JwtPayload {
  iat?: number;
  exp?: number;
  data: {
    role: "admin" | "superadmin";
    id: string;
    name?: string; // Added name property
  };
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<{
    id: string;
    role: "admin" | "superadmin";
    name?: string; // Added name property
  } | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { toast } = useToast();

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
      try {
        const decoded = jwtDecode<JwtPayload>(token);

        // Check token expiration
        if (decoded.exp && decoded.exp * 1000 < Date.now()) {
          localStorage.removeItem("token");
        } else {
          const parsedUser: {
            id: string;
            role: "admin" | "superadmin";
            name?: string; // Added name property
          } = {
            id: decoded?.data?.id,
            role: decoded?.data?.role,
            name: decoded?.data?.name || "Admin User", // Providing a default if name doesn't exist
          };
          setUser(parsedUser);
        }
      } catch (err) {
        console.error("Invalid token:", err);
        localStorage.removeItem("token");
      }
    }

    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // Make real API request
      const response = await api.post("/users/admins/login", {
        email,
        password,
      });

      const token = response.data?.token;
      if (!token) throw new Error("No token received");

      localStorage.setItem("token", token);

      const decoded = jwtDecode<JwtPayload>(token);

      const parsedUser: {
        id: string;
        role: "admin" | "superadmin";
        name?: string; // Added name property
      } = {
        id: decoded?.data?.id,
        role: decoded?.data?.role,
        name: decoded?.data?.name || "Admin User", // Providing a default if name doesn't exist
      };
      setUser(parsedUser);

      toast({
        title: "Login successful",
        description: `Welcome back!`,
      });
    } catch (error: any) {
      toast({
        title: "Login failed",
        description:
          error?.response?.data?.message ||
          error.message ||
          "Something went wrong",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("token");
    toast({
      title: "Logged out",
      description: "You have been logged out successfully",
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        forgotPassword: async () => {
          toast({
            title: "Password reset email sent",
            description: "Please check your email for further instructions",
          });
        },
        resetPassword: async () => {
          toast({
            title: "Password reset successful",
            description: "You can now login with your new password",
          });
        },
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};
