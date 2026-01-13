import { apiClient } from "@/lib/api";
import type { Project, Property, Developer } from "@/lib/types/real-estate";

// API функции для работы с проектами недвижимости

export const realEstateApi = {
  // Получение списка проектов
  getProjects: async () => {
    const { data } = await apiClient.get<Project[]>("/api/real-estate/projects");
    return data;
  },

  // Получение одного проекта
  getProject: async (id: string) => {
    const { data } = await apiClient.get<Project>(`/api/real-estate/projects/${id}`);
    return data;
  },

  // Получение объектов недвижимости по проекту
  getProperties: async (projectId: string) => {
    const { data } = await apiClient.get<Property[]>(
      `/api/real-estate/projects/${projectId}/properties`
    );
    return data;
  },

  // Получение одного объекта недвижимости
  getProperty: async (propertyId: string) => {
    const { data } = await apiClient.get<Property>(
      `/api/real-estate/properties/${propertyId}`
    );
    return data;
  },

  // Получение застройщиков
  getDevelopers: async () => {
    const { data } = await apiClient.get<Developer[]>("/api/real-estate/developers");
    return data;
  },
};
