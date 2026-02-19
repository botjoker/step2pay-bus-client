"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/auth-context";
import { clientEventsApi, type MyRegistration } from "@/lib/api/events";
import { useRouter } from "next/navigation";
import { ArrowLeft, Calendar, MapPin, QrCode, Clock, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const STATUS_LABEL: Record<string, { label: string; color: string }> = {
  registered:  { label: "Зарегистрирован",  color: "bg-blue-100 text-blue-700" },
  confirmed:   { label: "Подтверждён",       color: "bg-green-100 text-green-700" },
  attended:    { label: "Присутствовал",     color: "bg-gray-100 text-gray-600" },
  cancelled:   { label: "Отменён",           color: "bg-red-100 text-red-600" },
};

function EventCard({ reg }: { reg: MyRegistration }) {
  const router = useRouter();
  const status = STATUS_LABEL[reg.status] ?? { label: reg.status, color: "bg-gray-100 text-gray-600" };
  const startDate = new Date(reg.event.start_date);
  // Мероприятие считается прошедшим только если закончился end_date (или start_date если end нет)
  const endDate = reg.event.end_date ? new Date(reg.event.end_date) : startDate;
  const isPast = endDate < new Date() && reg.event.stage !== "started";

  const handleClick = () => {
    router.push(`/cabinet/events/${reg.event_id}`);
  };

  return (
    <Card
      className={`cursor-pointer hover:shadow-md transition-shadow ${isPast ? "opacity-60" : ""}`}
      onClick={handleClick}
    >
      <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-2">
              <CardTitle className="text-base leading-snug">{reg.event.title}</CardTitle>
              <div className="flex items-center gap-1 shrink-0">
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${status.color}`}>
                  {status.label}
                </span>
                <ChevronRight className="h-4 w-4 text-gray-400" />
              </div>
            </div>
      </CardHeader>
      <CardContent className="space-y-2 text-sm text-gray-600">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 shrink-0 text-blue-500" />
          <span>
            {startDate.toLocaleDateString("ru-RU", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
            {reg.event.end_date && reg.event.end_date !== reg.event.start_date && (
              <> — {new Date(reg.event.end_date).toLocaleDateString("ru-RU", { day: "numeric", month: "long" })}</>
            )}
          </span>
        </div>

        {reg.event.address && (
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 shrink-0 text-blue-500" />
            <span>{reg.event.address}</span>
          </div>
        )}

        {reg.event.stage && (
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 shrink-0 text-blue-500" />
            <span className="capitalize">{
              reg.event.stage === "registration" ? "Идёт регистрация" :
              reg.event.stage === "started"      ? "Проходит сейчас" :
              reg.event.stage === "finished"     ? "Завершилось"     :
              reg.event.stage
            }</span>
          </div>
        )}

        {reg.qr_code && (
          <div className="flex items-center gap-2 pt-1 border-t border-gray-100">
            <QrCode className="h-4 w-4 shrink-0 text-gray-400" />
            <code className="text-xs bg-gray-100 px-2 py-0.5 rounded">{reg.qr_code}</code>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function CabinetEventsPage() {
  const { user } = useAuth();
  const router = useRouter();

  const modules = user?.enabled_modules;
  const hasEvents = !modules?.length || modules.includes("events");

  const { data: registrations, isLoading } = useQuery({
    queryKey: ["myRegistrations"],
    queryFn: clientEventsApi.getMyRegistrations,
    enabled: !!user && hasEvents,
  });

  const now = new Date();
  const upcoming = registrations?.filter((r) => {
    const end = r.event.end_date ? new Date(r.event.end_date) : new Date(r.event.start_date);
    return end >= now || r.event.stage === "started";
  }) ?? [];
  const past = registrations?.filter((r) => {
    const end = r.event.end_date ? new Date(r.event.end_date) : new Date(r.event.start_date);
    return end < now && r.event.stage !== "started";
  }) ?? [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => router.push("/cabinet")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Мои мероприятия</h2>
          <p className="text-sm text-gray-500">Мероприятия, на которые вы зарегистрированы</p>
        </div>
      </div>

      {isLoading && (
        <div className="text-center py-12 text-gray-500">Загрузка...</div>
      )}

      {!isLoading && registrations?.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <Calendar className="h-12 w-12 mx-auto mb-3 opacity-40" />
          <p className="text-lg font-medium">Нет регистраций</p>
          <p className="text-sm mt-1">Вы ещё не зарегистрировались ни на одно мероприятие</p>
        </div>
      )}

      {upcoming.length > 0 && (
        <section>
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
            Предстоящие
          </h3>
          <div className="grid gap-3 sm:grid-cols-2">
            {upcoming.map((reg) => <EventCard key={reg.id} reg={reg} />)}
          </div>
        </section>
      )}

      {past.length > 0 && (
        <section>
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
            Прошедшие
          </h3>
          <div className="grid gap-3 sm:grid-cols-2">
            {past.map((reg) => <EventCard key={reg.id} reg={reg} />)}
          </div>
        </section>
      )}
    </div>
  );
}
