import { FolderGit2 } from "lucide-react";

import ProjectCard from "@/components/projects/ProjectCard";
import { projectConfigs } from "@/config/projects";


export default function ProjectsPage() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
      <header className="max-w-3xl">
        <div className="flex items-center gap-3 text-teal-700 dark:text-teal-300">
          <FolderGit2 aria-hidden="true" className="h-6 w-6" />
          <span className="text-sm font-semibold">项目实践</span>
        </div>
        <h1 className="mt-4 text-4xl font-bold text-slate-950 dark:text-white sm:text-5xl">
          项目
        </h1>
        <p className="mt-5 text-base leading-8 text-slate-600 dark:text-slate-300 sm:text-lg">
          记录正在使用、验证与整理中的工程实践。状态、入口和公开边界均以当前真实进度为准。
        </p>
      </header>

      <div className="mt-12 grid gap-6 lg:grid-cols-3">
        {projectConfigs.map((project) => (
          <ProjectCard key={project.slug} project={project} />
        ))}
      </div>
    </main>
  );
}
