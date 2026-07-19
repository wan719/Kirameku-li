import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Code2, ExternalLink } from "lucide-react";

import {
  getProjectPrimaryAction,
  getProjectRepositoryUrl,
  type ProjectConfig,
} from "@/config/projects";


export default function ProjectCard({ project }: { project: ProjectConfig }) {
  const action = getProjectPrimaryAction(project);
  const repositoryUrl = getProjectRepositoryUrl(project);
  const isPrivateKnowledgeBase = project.slug === "second-brain";

  return (
    <article className="flex min-w-0 flex-col overflow-hidden rounded-lg border border-slate-200 bg-white/70 shadow-sm dark:border-slate-700 dark:bg-slate-900/55">
      <div className={`relative aspect-video overflow-hidden ${isPrivateKnowledgeBase ? "bg-slate-950" : "bg-slate-100 dark:bg-slate-950"}`}>
        <Image
          src={project.cover}
          alt={`${project.title} 项目封面`}
          fill
          unoptimized
          sizes="(max-width: 1023px) 100vw, 33vw"
          className={isPrivateKnowledgeBase ? "object-contain p-7" : "object-cover"}
        />
      </div>
      <div className="flex flex-1 flex-col p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <h2 className="text-xl font-bold text-slate-950 dark:text-white">
            {project.title}
          </h2>
          <span className="rounded-sm border border-violet-300/70 px-2 py-1 text-xs font-semibold text-violet-700 dark:border-violet-400/30 dark:text-violet-200">
            {project.statusLabel}
          </span>
        </div>
        <p className="mt-4 text-sm leading-7 text-slate-600 dark:text-slate-300">
          {project.summary}
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          {project.techStack.slice(0, 6).map((tech) => (
            <span key={tech} className="rounded-sm bg-slate-100 px-2 py-1 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-300">
              {tech}
            </span>
          ))}
        </div>
        {(action || repositoryUrl) && (
          <div className="mt-auto flex flex-wrap gap-3 pt-7">
            {action && (
              <Link
                href={action.href}
                target={action.external ? "_blank" : undefined}
                rel={action.external ? "noopener noreferrer" : undefined}
                className="inline-flex min-h-11 items-center gap-2 rounded-md bg-teal-700 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 dark:bg-teal-500 dark:text-slate-950 dark:hover:bg-teal-400"
              >
                查看项目
                {action.external ? (
                  <ExternalLink aria-hidden="true" className="h-4 w-4" />
                ) : (
                  <ArrowRight aria-hidden="true" className="h-4 w-4" />
                )}
              </Link>
            )}
            {repositoryUrl && (
              <a
                href={repositoryUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-11 items-center gap-2 rounded-md border border-slate-300 bg-white/65 px-4 py-2 text-sm font-semibold text-slate-800 hover:border-teal-600 hover:text-teal-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 dark:border-slate-600 dark:bg-slate-900/60 dark:text-slate-100 dark:hover:border-teal-400 dark:hover:text-teal-200"
              >
                <Code2 aria-hidden="true" className="h-4 w-4" />
                GitHub 源码
                <ExternalLink aria-hidden="true" className="h-3.5 w-3.5" />
              </a>
            )}
          </div>
        )}
      </div>
    </article>
  );
}
