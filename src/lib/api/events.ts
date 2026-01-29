import axios from "axios";
import { config } from "../../local_config";
import type {
  EventsListResponse,
  EventResponse,
  EventScheduleResponse,
  EventSponsorsResponse,
  EventStatsResponse,
} from "@/lib/types/events";

const API_URL = config.api;

// Публичный API клиент (без токена авторизации)
const publicApiClient = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Публичный API для событий
export const publicEventsApi = {
  // Получение списка событий
  getEvents: async (params?: {
    domain?: string;
    event_type?: string;
    category?: string;
    page?: number;
    limit?: number;
  }) => {
    const { data } = await publicApiClient.get<EventsListResponse>("/public/events", {
      params,
    });
    return data;
  },

  // Получение одного события по ID
  getEventById: async (id: string) => {
    const { data } = await publicApiClient.get<EventResponse>(`/public/events/${id}`);
    return data;
  },

  // Получение одного события по slug
  getEventBySlug: async (slug: string) => {
    const { data } = await publicApiClient.get<EventResponse>(`/public/events/slug/${slug}`);
    return data;
  },

  // Получение программы события
  getEventSchedule: async (eventId: string) => {
    const { data } = await publicApiClient.get<EventScheduleResponse>(
      `/public/events/${eventId}/schedule`
    );
    return data;
  },

  // Получение спонсоров события
  getEventSponsors: async (eventId: string) => {
    const { data } = await publicApiClient.get<EventSponsorsResponse>(
      `/public/events/${eventId}/sponsors`
    );
    return data;
  },

  // Получение статистики события
  getEventStats: async (eventId: string) => {
    const { data } = await publicApiClient.get<EventStatsResponse>(
      `/public/events/${eventId}/stats`
    );
    return data;
  },
};
