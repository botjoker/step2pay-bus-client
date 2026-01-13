import { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProjectDetail } from "@/components/projects/project-detail";

interface Props {
  params: Promise<{ id: string }>;
}

// Генерация метаданных для SEO
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;

  // В продакшене здесь будет запрос к API
  // const project = await realEstateApi.getProject(id);

  return {
    title: `Проект ${id}`,
    description: `Информация о проекте недвижимости`,
    openGraph: {
      title: `Проект ${id}`,
      description: `Информация о проекте недвижимости`,
    },
  };
}

export default async function ProjectPage({ params }: Props) {
  const { id } = await params;

  // В продакшене здесь будет проверка существования проекта
  // const project = await realEstateApi.getProject(id);
  // if (!project) notFound();

  return (
    <div className="container mx-auto py-8">
      <ProjectDetail projectId={id} />
    </div>
  );
}
