"use client";

import { useAuth } from "@/contexts/auth-context";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Building2,
  Calendar,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";

interface PublicSettings {
  domain: string;
  settings: Record<string, any>;
}

export default function CabinetPage() {
  const { user } = useAuth();

  // Получаем публичные настройки тенанта
  const { data: publicSettings } = useQuery<PublicSettings>({
    queryKey: ["publicSettings", user?.domain],
    queryFn: async () => {
      if (!user?.domain) throw new Error("Domain not found");
      const response = await apiClient.get(
        `/public/settings?domain=${user.domain}`
      );
      return response.data;
    },
    enabled: !!user?.domain,
  });

  if (!user) return null;

  const displayName =
    user.name ||
    user.display_name ||
    `${user.first_name || ""} ${user.last_name || ""}`.trim() ||
    user.username ||
    "Пользователь";

  const isCustomer = user.entity_type === "customer";
  const isSpecialist = user.entity_type === "specialist";

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Добро пожаловать, {displayName}!
        </h2>
        <p className="text-gray-600">
          {isCustomer && "Вы вошли как клиент"}
          {isSpecialist && "Вы вошли как специалист"}
          {!isCustomer && !isSpecialist && "Личный кабинет"}
        </p>
      </div>

      {/* User Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Personal Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="mr-2 h-5 w-5 text-blue-600" />
              Личные данные
            </CardTitle>
            <CardDescription>
              Информация о вашем аккаунте
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {user.email && (
              <div className="flex items-center">
                <Mail className="mr-3 h-4 w-4 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="text-sm font-medium">{user.email}</p>
                </div>
              </div>
            )}

            {(user.phone || user.customer_phone || user.specialist_phone) && (
              <div className="flex items-center">
                <Phone className="mr-3 h-4 w-4 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Телефон</p>
                  <p className="text-sm font-medium">
                    {user.phone || user.customer_phone || user.specialist_phone}
                  </p>
                </div>
              </div>
            )}

            {user.username && (
              <div className="flex items-center">
                <User className="mr-3 h-4 w-4 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Логин</p>
                  <p className="text-sm font-medium">{user.username}</p>
                </div>
              </div>
            )}

            {(user.address_city || user.address_street) && (
              <div className="flex items-center">
                <MapPin className="mr-3 h-4 w-4 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Адрес</p>
                  <p className="text-sm font-medium">
                    {[user.address_city, user.address_street]
                      .filter(Boolean)
                      .join(", ")}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Specialist Info */}
        {isSpecialist && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Briefcase className="mr-2 h-5 w-5 text-blue-600" />
                Информация о специалисте
              </CardTitle>
              <CardDescription>
                Профессиональные данные
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {user.position && (
                <div className="flex items-center">
                  <Briefcase className="mr-3 h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Должность</p>
                    <p className="text-sm font-medium">{user.position}</p>
                  </div>
                </div>
              )}

              {user.specialization && (
                <div className="flex items-center">
                  <Calendar className="mr-3 h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Специализация</p>
                    <p className="text-sm font-medium">{user.specialization}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Customer Info */}
        {isCustomer && user.customer_type && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="mr-2 h-5 w-5 text-blue-600" />
                Тип клиента
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm font-medium">
                {user.customer_type === "individual"
                  ? "Физическое лицо"
                  : "Организация"}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Company Info */}
        {user.company_name && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Building2 className="mr-2 h-5 w-5 text-blue-600" />
                Организация
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm font-medium">{user.company_name}</p>
              {user.domain && (
                <p className="text-xs text-gray-500 mt-1">{user.domain}</p>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Tenant Public Settings */}
      {publicSettings?.settings &&
        Object.keys(publicSettings.settings).length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Building2 className="mr-2 h-5 w-5 text-blue-600" />
                Настройки организации
              </CardTitle>
              <CardDescription>
                Публичные настройки вашей организации
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(publicSettings.settings).map(([key, value]) => (
                  <div key={key} className="border-b border-gray-200 pb-3 last:border-0">
                    <p className="text-sm font-medium text-gray-700 mb-1">
                      {formatSettingKey(key)}
                    </p>
                    <p className="text-sm text-gray-600">
                      {formatSettingValue(value)}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
    </div>
  );
}

// Вспомогательные функции для форматирования настроек
function formatSettingKey(key: string): string {
  return key
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function formatSettingValue(value: any): string {
  if (typeof value === "boolean") {
    return value ? "Да" : "Нет";
  }
  if (typeof value === "object") {
    return JSON.stringify(value, null, 2);
  }
  return String(value);
}
