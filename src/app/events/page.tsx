"use client";

import { useQuery } from "@tanstack/react-query";
import { publicEventsApi } from "@/lib/api/events";
import { EventsList } from "@/components/events/events-list";
import { useDomain } from "@/lib/hooks/useDomain";

export default function EventsPage() {
  const domain = useDomain();

  const { data, isLoading, error } = useQuery({
    queryKey: ["public-events", domain],
    queryFn: () => publicEventsApi.getEvents({ domain: domain || undefined }),
  });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-4 text-gray-600">Загрузка событий...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <p className="text-red-600">Ошибка загрузки событий</p>
            <p className="text-gray-600 mt-2">Попробуйте обновить страницу</p>
          </div>
        </div>
      </div>
    );
  }

  const events = data?.data || [];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Мероприятия</h1>
        <p className="text-gray-600">
          {events.length > 0
            ? `Найдено мероприятий: ${events.length}`
            : "Нет доступных мероприятий"}
        </p>
      </div>

      {events.length > 0 ? (
        <EventsList events={events} />
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">
            На данный момент нет запланированных мероприятий
          </p>
        </div>
      )}
    </div>
  );
}
