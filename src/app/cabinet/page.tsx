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
  ChevronRight,
  Ticket,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { clientEventsApi } from "@/lib/api/events";

export default function CabinetPage() {
  const { user } = useAuth();
  const router = useRouter();

  // Показываем если модуль явно включён, или если таблица modules не заполнена (пустой список)
  const modules = user?.enabled_modules;
  const hasEvents = !modules?.length || modules.includes("events");

  // Регистрации подгружаем только если модуль включён
  const { data: registrations } = useQuery({
    queryKey: ["myRegistrations"],
    queryFn: clientEventsApi.getMyRegistrations,
    enabled: !!hasEvents,
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

      {/* Мои мероприятия — только если модуль включён */}
      {hasEvents && (
        <Card
          className="cursor-pointer hover:shadow-md transition-shadow border-blue-100"
          onClick={() => router.push("/cabinet/events")}
        >
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center">
                <Ticket className="mr-2 h-5 w-5 text-blue-600" />
                Мои мероприятия
              </span>
              <ChevronRight className="h-5 w-5 text-gray-400" />
            </CardTitle>
            <CardDescription>Мероприятия, на которые вы зарегистрированы</CardDescription>
          </CardHeader>
          <CardContent>
            {!registrations || registrations.length === 0 ? (
              <p className="text-sm text-gray-500">Нет активных регистраций</p>
            ) : (
              <div className="space-y-2">
                {registrations.slice(0, 3).map((reg) => (
                  <div key={reg.id} className="flex items-center justify-between text-sm">
                    <span className="font-medium truncate max-w-[60%]">{reg.event.title}</span>
                    <span className="text-gray-500 shrink-0">
                      {new Date(reg.event.start_date).toLocaleDateString("ru-RU", {
                        day: "numeric",
                        month: "short",
                      })}
                    </span>
                  </div>
                ))}
                {registrations.length > 3 && (
                  <p className="text-xs text-blue-600 mt-1">
                    +{registrations.length - 3} ещё
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

    </div>
  );
}
