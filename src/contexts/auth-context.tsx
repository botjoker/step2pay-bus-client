"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { ClientUser } from "@/lib/auth/types";
import { authApi } from "@/lib/auth/api";
import { tokenManager } from "@/lib/auth/token-manager";

interface AuthContextType {
  user: ClientUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<ClientUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const checkAuth = async () => {
    try {
      const token = tokenManager.getToken();
      if (!token) {
        setUser(null);
        return;
      }

      const userData = await authApi.getMe();
      setUser(userData);
    } catch (error) {
      console.error("Auth check failed:", error);
      setUser(null);
      tokenManager.clearTokens();
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (username: string, password: string) => {
    await authApi.login({ username, password });
    await checkAuth();
  };

  const logout = async () => {
    await authApi.logout();
    setUser(null);
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated, isLoading, login, logout, checkAuth }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
