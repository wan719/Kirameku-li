import type { Metadata } from "next";
import { notFound } from "next/navigation";

import ProjectDetail from "@/components/projects/ProjectDetail";
import {
  getProjectDetailConfig,
  projectDetailSlugs,
} from "@/config/projects";


type ProjectPageProps = {
  params: Promise<{ slug: string }>;
};

export const dynamicParams = true;

export function generateStaticParams() {
  return projectDetailSlugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: ProjectPageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = getProjectDetailConfig(slug);
  if (!project) return { title: "项目不存在" };
  return {
    title: project.title,
    description: project.summary,
  };
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { slug } = await params;
  const project = getProjectDetailConfig(slug);
  if (!project) notFound();
  return <ProjectDetail project={project} />;
}
