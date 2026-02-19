import axios from "axios";
import { config } from "../../local_config";
import { apiClient } from "@/lib/api";
import type {
  EventsListResponse,
  EventResponse,
  EventScheduleResponse,
  EventSponsorsResponse,
  EventStatsResponse,
  PublicEventRegistrationRequest,
  EventRegistrationResponse,
  PublicNominationsResponse,
  RegistrationFieldsResponse,
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

  // Регистрация на событие по ID
  registerForEvent: async (eventId: string, request: PublicEventRegistrationRequest) => {
    const { data } = await publicApiClient.post<EventRegistrationResponse>(
      `/public/events/${eventId}/register`,
      request
    );
    return data;
  },

  // Регистрация на событие по slug
  registerForEventBySlug: async (slug: string, request: PublicEventRegistrationRequest) => {
    const { data } = await publicApiClient.post<EventRegistrationResponse>(
      `/public/events/slug/${slug}/register`,
      request
    );
    return data;
  },

  // Получение номинаций события
  getEventNominations: async (eventId: string) => {
    const { data } = await publicApiClient.get<PublicNominationsResponse>(
      `/public/events/${eventId}/nominations`
    );
    return data;
  },

  // Получение кастомных полей регистрации
  getEventRegistrationFields: async (eventId: string) => {
    const { data } = await publicApiClient.get<RegistrationFieldsResponse>(
      `/public/events/${eventId}/registration-fields`
    );
    return data;
  },
};

// API для авторизованного клиента
export interface MyRegistration {
  id: string;
  event_id: string;
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  status: string;
  qr_code?: string;
  registered_at?: string;
  event: {
    title: string;
    slug?: string;
    start_date: string;
    end_date?: string;
    address?: string;
    stage?: string;
    cover_image?: string;
  };
}

export const clientEventsApi = {
  getMyRegistrations: async (): Promise<MyRegistration[]> => {
    const { data } = await apiClient.get<{ success: boolean; data: MyRegistration[] }>(
      "/api/client/events/my-registrations"
    );
    return data.data;
  },
};
