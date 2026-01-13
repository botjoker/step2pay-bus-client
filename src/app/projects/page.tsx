import { Metadata } from "next";
import { ProjectsList } from "@/components/projects/projects-list";

export const metadata: Metadata = {
  title: "Проекты",
  description: "Проекты новостроек и жилых комплексов",
  openGraph: {
    title: "Проекты недвижимости",
    description: "Проекты новостроек и жилых комплексов",
  },
};

export default function ProjectsPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-4xl font-bold mb-8">Проекты</h1>
      <ProjectsList />
    </div>
  );
}
