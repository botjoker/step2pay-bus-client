"use client";

import { useQuery } from "@tanstack/react-query";
import { realEstateApi } from "@/lib/api/real-estate";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function ProjectsList() {
  const { data: projects, isLoading, error } = useQuery({
    queryKey: ["projects"],
    queryFn: realEstateApi.getProjects,
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="border rounded-lg p-6 animate-pulse">
            <div className="h-6 bg-gray-200 rounded mb-4"></div>
            <div className="h-4 bg-gray-200 rounded mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500">Ошибка загрузки проектов</p>
      </div>
    );
  }

  if (!projects || projects.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Проекты не найдены</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {projects.map((project) => (
        <Link
          key={project.id}
          href={`/projects/${project.id}`}
          className="border rounded-lg p-6 hover:shadow-lg transition-shadow"
        >
          <h3 className="text-xl font-semibold mb-2">{project.name}</h3>
          {project.description && (
            <p className="text-muted-foreground mb-4 line-clamp-3">
              {project.description}
            </p>
          )}
          {project.location && (
            <p className="text-sm text-muted-foreground mb-2">
              📍 {project.location}
            </p>
          )}
          <div className="flex items-center justify-between mt-4">
            <span className="text-sm px-2 py-1 rounded bg-primary/10 text-primary">
              {project.status}
            </span>
            <Button variant="ghost" size="sm">
              Подробнее →
            </Button>
          </div>
        </Link>
      ))}
    </div>
  );
}
