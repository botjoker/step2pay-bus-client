import Link from "next/link";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import type { Event } from "@/lib/types/events";
import { Card } from "@/components/ui/card";

interface EventsListProps {
  events: Event[];
}

export function EventsList({ events }: EventsListProps) {
  const getEventStatusBadge = (status: string, stage?: string) => {
    if (stage) {
      const stageConfig: Record<string, { label: string; color: string }> = {
        comming: { label: "Готовится", color: "bg-blue-100 text-blue-800" },
        registration: { label: "Регистрация", color: "bg-green-100 text-green-800" },
        started: { label: "Стартовал", color: "bg-purple-100 text-purple-800" },
        ended: { label: "Закончился", color: "bg-gray-100 text-gray-800" },
      };

      const config = stageConfig[stage] || { label: stage, color: "bg-gray-100 text-gray-800" };
      return (
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${config.color}`}>
          {config.label}
        </span>
      );
    }

    const statusColor =
      status === "published"
        ? "bg-green-100 text-green-800"
        : "bg-gray-100 text-gray-800";

    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColor}`}>
        {status === "published" ? "Опубликовано" : status}
      </span>
    );
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {events.map((event) => (
        <Link key={event.id} href={`/events/${event.slug || event.id}`}>
          <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer h-full">
            {event.cover_image && (
              <div className="w-full h-48 bg-gray-200 overflow-hidden">
                <img
                  src={event.cover_image}
                  alt={event.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <div className="p-6">
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-xl font-bold flex-1">{event.title}</h3>
              </div>

              <div className="mb-3">{getEventStatusBadge(event.status, event.stage)}</div>

              {event.short_description && (
                <p className="text-gray-600 mb-4 line-clamp-3">{event.short_description}</p>
              )}

              <div className="space-y-2 text-sm text-gray-500">
                {event.start_date && (
                  <div className="flex items-center">
                    <svg
                      className="w-4 h-4 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    <span>
                      {format(new Date(event.start_date), "d MMMM yyyy, HH:mm", { locale: ru })}
                    </span>
                  </div>
                )}

                {event.city && (
                  <div className="flex items-center">
                    <svg
                      className="w-4 h-4 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    <span>{event.city}</span>
                  </div>
                )}

                {event.is_online && (
                  <div className="flex items-center">
                    <svg
                      className="w-4 h-4 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
                      />
                    </svg>
                    <span>Онлайн</span>
                  </div>
                )}

                {event.current_participants > 0 && (
                  <div className="flex items-center">
                    <svg
                      className="w-4 h-4 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    </svg>
                    <span>{event.current_participants} участников</span>
                  </div>
                )}
              </div>

              {event.category && (
                <div className="mt-4">
                  <span className="inline-block px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded">
                    {event.category}
                  </span>
                </div>
              )}
            </div>
          </Card>
        </Link>
      ))}
    </div>
  );
}
