"use client";

import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { ReactNode, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { LogOut, User } from "lucide-react";

export default function CabinetLayout({ children }: { children: ReactNode }) {
  const { user, isLoading, isAuthenticated, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  // Страница логина не требует авторизации
  const isLoginPage = pathname === "/cabinet/login";

  useEffect(() => {
    if (!isLoading && !isAuthenticated && !isLoginPage) {
      router.push("/cabinet/login");
    }
  }, [isLoading, isAuthenticated, isLoginPage, router]);

  // Для страницы логина показываем контент без проверки авторизации
  if (isLoginPage) {
    return <>{children}</>;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Загрузка...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const handleLogout = async () => {
    await logout();
    router.push("/cabinet/login");
  };

  const displayName =
    user?.name ||
    user?.display_name ||
    `${user?.first_name || ""} ${user?.last_name || ""}`.trim() ||
    user?.username ||
    "Пользователь";

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <User className="h-8 w-8 text-blue-600" />
                <div>
                  <h1 className="text-xl font-bold text-gray-900">
                    Личный кабинет
                  </h1>
                  {user?.company_name && (
                    <p className="text-sm text-gray-500">{user.company_name}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">
                  {displayName}
                </p>
                {user?.email && (
                  <p className="text-xs text-gray-500">{user.email}</p>
                )}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Выйти
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">{children}</main>
    </div>
  );
}
