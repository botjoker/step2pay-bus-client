"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { publicEventsApi } from "@/lib/api/events";
import { TicketMap } from "@/components/tickets/TicketMap";
import { ArrowLeft, Ticket } from "lucide-react";

export default function EventTicketsPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slug);

  const { data: eventData, isLoading } = useQuery({
    queryKey: ["public-event", slug],
    queryFn: () =>
      isUUID
        ? publicEventsApi.getEventById(slug)
        : publicEventsApi.getEventBySlug(slug),
  });

  const event = eventData?.data;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Хедер */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Назад
          </button>
          <div className="flex-1 min-w-0">
            {isLoading ? (
              <div className="h-5 w-48 bg-gray-200 animate-pulse rounded" />
            ) : (
              <>
                <p className="text-xs text-gray-400 truncate">{event?.title}</p>
                <h1 className="text-lg font-bold leading-tight flex items-center gap-2">
                  <Ticket className="w-4 h-4 text-indigo-500 flex-shrink-0" />
                  Выбор мест
                </h1>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Контент */}
      <div className="container mx-auto px-4 py-6">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3 text-gray-400">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500" />
            <p className="text-sm">Загрузка...</p>
          </div>
        ) : !event?.tickets_config_id ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3 text-gray-400">
            <Ticket className="w-12 h-12 opacity-30" />
            <p>Билетная касса не подключена к этому мероприятию</p>
            <button
              onClick={() => router.back()}
              className="mt-2 text-sm text-indigo-600 hover:underline"
            >
              Вернуться к мероприятию
            </button>
          </div>
        ) : (
          <TicketMap configId={event.tickets_config_id} />
        )}
      </div>
    </div>
  );
}
