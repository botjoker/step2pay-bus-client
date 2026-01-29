"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { publicEventsApi } from "@/lib/api/events";
import { Card } from "@/components/ui/card";

export default function EventDetailPage() {
  const params = useParams();
  const slug = params.slug as string;

  // Проверяем, является ли slug UUID
  const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slug);

  const { data: eventData, isLoading: eventLoading } = useQuery({
    queryKey: ["public-event", slug],
    queryFn: () => isUUID 
      ? publicEventsApi.getEventById(slug)
      : publicEventsApi.getEventBySlug(slug),
  });

  const event = eventData?.data;

  const { data: scheduleData } = useQuery({
    queryKey: ["public-event-schedule", event?.id],
    queryFn: () => publicEventsApi.getEventSchedule(event!.id),
    enabled: !!event?.id,
  });

  const { data: sponsorsData } = useQuery({
    queryKey: ["public-event-sponsors", event?.id],
    queryFn: () => publicEventsApi.getEventSponsors(event!.id),
    enabled: !!event?.id,
  });

  const { data: statsData } = useQuery({
    queryKey: ["public-event-stats", event?.id],
    queryFn: () => publicEventsApi.getEventStats(event!.id),
    enabled: !!event?.id,
  });

  if (eventLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-4 text-gray-600">Загрузка...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-2">Мероприятие не найдено</h2>
          <p className="text-gray-600">Проверьте правильность ссылки</p>
        </div>
      </div>
    );
  }

  const schedule = scheduleData?.data || [];
  const sponsors = sponsorsData?.data || [];
  const stats = statsData?.data;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Обложка */}
      {event.cover_image && (
        <div className="w-full h-96 bg-gray-200 rounded-lg overflow-hidden mb-8">
          <img
            src={event.cover_image}
            alt={event.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Заголовок и основная информация */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4">{event.title}</h1>
        {event.short_description && (
          <p className="text-xl text-gray-600 mb-4">{event.short_description}</p>
        )}

        <div className="flex flex-wrap gap-4 mb-6">
          {event.start_date && (
            <div className="flex items-center text-gray-700">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <span className="font-medium">
                {format(new Date(event.start_date), "d MMMM yyyy, HH:mm", { locale: ru })}
              </span>
            </div>
          )}

          {event.city && (
            <div className="flex items-center text-gray-700">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
              </svg>
              <span>{event.city}</span>
            </div>
          )}

          {stats && (
            <div className="flex items-center text-gray-700">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              <span>{stats.total_registrations} зарегистрировано</span>
            </div>
          )}
        </div>
      </div>

      {/* Описание */}
      {event.description && (
        <Card className="p-6 mb-8">
          <h2 className="text-2xl font-bold mb-4">О мероприятии</h2>
          <div className="prose max-w-none">
            <p className="whitespace-pre-wrap text-gray-700">{event.description}</p>
          </div>
        </Card>
      )}

      {/* Программа */}
      {schedule.length > 0 && (
        <Card className="p-6 mb-8">
          <h2 className="text-2xl font-bold mb-4">Программа мероприятия</h2>
          <div className="space-y-4">
            {schedule.map((block) => (
              <div key={block.id} className="border-l-4 border-blue-500 pl-4 py-2">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-bold text-lg">{block.title}</h3>
                    {block.description && (
                      <p className="text-gray-600 mt-1">{block.description}</p>
                    )}
                    {block.speaker_name && (
                      <p className="text-sm text-gray-500 mt-2">
                        <span className="font-medium">Спикер:</span> {block.speaker_name}
                      </p>
                    )}
                    {block.location && (
                      <p className="text-sm text-gray-500 mt-1">
                        <span className="font-medium">Место:</span> {block.location}
                      </p>
                    )}
                  </div>
                  <div className="ml-4 text-right text-sm text-gray-600">
                    {format(new Date(block.start_time), "HH:mm", { locale: ru })}
                    {block.end_time &&
                      ` - ${format(new Date(block.end_time), "HH:mm", { locale: ru })}`}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Спонсоры */}
      {sponsors.length > 0 && (
        <Card className="p-6">
          <h2 className="text-2xl font-bold mb-4">Спонсоры</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {sponsors.map((sponsor) => (
              <div key={sponsor.id} className="text-center">
                {sponsor.logo && (
                  <div className="w-full h-24 bg-gray-100 rounded-lg flex items-center justify-center mb-2 overflow-hidden">
                    <img
                      src={sponsor.logo}
                      alt={sponsor.name}
                      className="max-w-full max-h-full object-contain p-2"
                    />
                  </div>
                )}
                <p className="font-medium text-sm">{sponsor.name}</p>
                {sponsor.tier && (
                  <p className="text-xs text-gray-500 mt-1">{sponsor.tier}</p>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
