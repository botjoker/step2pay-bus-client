"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { LoginForm } from "@/components/auth/login-form";
import { useEffect } from "react";

export default function CabinetLoginPage() {
  const router = useRouter();
  const { login, isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push("/cabinet");
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Загрузка...</div>
      </div>
    );
  }

  if (isAuthenticated) {
    return null;
  }

  const handleLogin = async (username: string, password: string) => {
    await login(username, password);
    router.push("/cabinet");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <LoginForm onSubmit={handleLogin} />
    </div>
  );
}
