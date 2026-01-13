"use client";

import { useQuery } from "@tanstack/react-query";
import { realEstateApi } from "@/lib/api/real-estate";
import { Button } from "@/components/ui/button";

interface Props {
  projectId: string;
}

export function ProjectDetail({ projectId }: Props) {
  const { data: project, isLoading } = useQuery({
    queryKey: ["project", projectId],
    queryFn: () => realEstateApi.getProject(projectId),
  });

  const { data: properties } = useQuery({
    queryKey: ["properties", projectId],
    queryFn: () => realEstateApi.getProperties(projectId),
  });

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="h-4 bg-gray-200 rounded w-2/3 mb-8"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2].map((i) => (
            <div key={i} className="h-48 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Проект не найден</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4">{project.name}</h1>
        {project.location && (
          <p className="text-lg text-muted-foreground mb-2">
            📍 {project.location}
          </p>
        )}
        {project.description && (
          <p className="text-muted-foreground mt-4">{project.description}</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="border rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Статус</p>
          <p className="text-lg font-semibold">{project.status}</p>
        </div>
        {project.total_units && (
          <div className="border rounded-lg p-4">
            <p className="text-sm text-muted-foreground">Всего объектов</p>
            <p className="text-lg font-semibold">{project.total_units}</p>
          </div>
        )}
        {project.sold_units !== null && (
          <div className="border rounded-lg p-4">
            <p className="text-sm text-muted-foreground">Продано</p>
            <p className="text-lg font-semibold">{project.sold_units}</p>
          </div>
        )}
      </div>

      {properties && properties.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold mb-4">Объекты недвижимости</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map((property) => (
              <div key={property.id} className="border rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-2">
                  {property.property_type}
                </h3>
                <div className="space-y-1 text-sm text-muted-foreground">
                  {property.area_sqm && <p>Площадь: {property.area_sqm} м²</p>}
                  {property.rooms && <p>Комнат: {property.rooms}</p>}
                  {property.floor && <p>Этаж: {property.floor}</p>}
                  {property.price && (
                    <p className="text-lg font-bold text-foreground mt-2">
                      {property.price.toLocaleString("ru-RU")} ₽
                    </p>
                  )}
                </div>
                <div className="mt-4">
                  <span
                    className={`text-sm px-2 py-1 rounded ${
                      property.status === "available"
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {property.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
