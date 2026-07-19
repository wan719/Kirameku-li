import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  Code2,
  ExternalLink,
  Milestone,
} from "lucide-react";

import {
  getProjectDemoUrl,
  getProjectRepositoryUrl,
  type ProjectConfig,
} from "@/config/projects";


function TextList({ items }: { items: readonly string[] }) {
  return (
    <ul className="mt-5 grid gap-3">
      {items.map((item) => (
        <li key={item} className="flex gap-3 text-sm leading-7 text-slate-700 dark:text-slate-200">
          <CheckCircle2 aria-hidden="true" className="mt-1.5 h-4 w-4 shrink-0 text-teal-700 dark:text-teal-300" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

export default function ProjectDetail({ project }: { project: ProjectConfig }) {
  const demoUrl = getProjectDemoUrl(project);
  const repositoryUrl = getProjectRepositoryUrl(project);

  return (
    <article className="min-w-0">
      <header className="border-b border-teal-900/10 dark:border-violet-200/10">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <Link href="/projects" className="site-footer-link inline-flex items-center gap-2 text-sm font-semibold">
            <ArrowLeft aria-hidden="true" className="h-4 w-4" />
            返回项目列表
          </Link>
          <div className="mt-8 grid items-center gap-9 lg:grid-cols-[minmax(0,0.88fr)_minmax(0,1.12fr)]">
            <div className="min-w-0">
              <span className="inline-flex rounded-sm border border-violet-300/70 px-2 py-1 text-xs font-semibold text-violet-700 dark:border-violet-400/30 dark:text-violet-200">
                {project.statusLabel}
              </span>
              <h1 className="mt-5 text-3xl font-bold leading-tight text-slate-950 dark:text-white sm:text-5xl">
                {project.title}
              </h1>
              <p className="mt-5 text-base leading-8 text-slate-600 dark:text-slate-300 sm:text-lg">
                {project.summary}
              </p>
              {(demoUrl || repositoryUrl) && (
                <div className="mt-8 flex flex-wrap gap-3">
                  {demoUrl && (
                    <a href={demoUrl} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center gap-2 rounded-md bg-teal-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-teal-800 dark:bg-teal-500 dark:text-slate-950 dark:hover:bg-teal-400">
                      在线演示
                      <ExternalLink aria-hidden="true" className="h-4 w-4" />
                    </a>
                  )}
                  {repositoryUrl && (
                    <a href={repositoryUrl} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center gap-2 rounded-md border border-slate-300 bg-white/65 px-5 py-2.5 text-sm font-semibold text-slate-800 hover:border-teal-600 dark:border-slate-600 dark:bg-slate-900/60 dark:text-slate-100 dark:hover:border-teal-400">
                      <Code2 aria-hidden="true" className="h-4 w-4" />
                      GitHub 源码
                      <ExternalLink aria-hidden="true" className="h-3.5 w-3.5" />
                    </a>
                  )}
                </div>
              )}
            </div>
            <div className="relative aspect-video overflow-hidden rounded-lg border border-slate-200 bg-slate-950 shadow-sm dark:border-slate-700">
              <Image src={project.cover} alt={`${project.title} 项目封面`} fill priority unoptimized sizes="(max-width: 1023px) 100vw, 56vw" className="object-cover" />
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-12 border-b border-slate-200 pb-14 dark:border-slate-700 lg:grid-cols-2">
          <section aria-labelledby="project-background">
            <h2 id="project-background" className="text-2xl font-bold text-slate-950 dark:text-white">项目背景</h2>
            <p className="mt-5 text-base leading-8 text-slate-600 dark:text-slate-300">{project.background}</p>
          </section>
          <section aria-labelledby="project-problem">
            <h2 id="project-problem" className="text-2xl font-bold text-slate-950 dark:text-white">解决的问题</h2>
            <p className="mt-5 text-base leading-8 text-slate-600 dark:text-slate-300">{project.problem}</p>
          </section>
        </div>

        <section aria-labelledby="project-stack" className="border-b border-slate-200 py-14 dark:border-slate-700">
          <h2 id="project-stack" className="text-2xl font-bold text-slate-950 dark:text-white">技术栈</h2>
          <div className="mt-6 flex flex-wrap gap-2">
            {project.techStack.map((tech) => (
              <span key={tech} className="rounded-sm border border-teal-700/20 bg-teal-50 px-3 py-2 text-sm font-medium text-teal-900 dark:border-teal-300/20 dark:bg-teal-950/35 dark:text-teal-100">{tech}</span>
            ))}
          </div>
        </section>

        <div className="grid gap-12 border-b border-slate-200 py-14 dark:border-slate-700 lg:grid-cols-2">
          <section aria-labelledby="project-capabilities">
            <h2 id="project-capabilities" className="text-2xl font-bold text-slate-950 dark:text-white">核心能力</h2>
            <TextList items={project.capabilities} />
          </section>
          <section aria-labelledby="project-progress">
            <h2 id="project-progress" className="text-2xl font-bold text-slate-950 dark:text-white">当前进度</h2>
            <TextList items={project.milestones} />
          </section>
        </div>

        <div className="grid gap-12 pt-14 lg:grid-cols-2">
          <section aria-labelledby="project-history">
            <div className="flex items-center gap-3">
              <Milestone aria-hidden="true" className="h-5 w-5 text-violet-600 dark:text-violet-300" />
              <h2 id="project-history" className="text-2xl font-bold text-slate-950 dark:text-white">开发历程</h2>
            </div>
            <ol className="mt-6 border-l border-violet-300 pl-6 dark:border-violet-500/40">
              {project.developmentHistory.map((item, index) => (
                <li key={item} className="relative pb-7 text-sm leading-7 text-slate-700 last:pb-0 dark:text-slate-200">
                  <span className="absolute -left-[31px] top-1.5 flex h-3 w-3 items-center justify-center rounded-full bg-violet-600 ring-4 ring-white dark:bg-violet-300 dark:ring-slate-950" aria-hidden="true" />
                  <span className="mr-2 font-semibold text-violet-700 dark:text-violet-200">{String(index + 1).padStart(2, "0")}</span>
                  {item}
                </li>
              ))}
            </ol>
          </section>
          <section aria-labelledby="project-next">
            <h2 id="project-next" className="text-2xl font-bold text-slate-950 dark:text-white">后续计划</h2>
            <TextList items={project.nextSteps} />
          </section>
        </div>
      </div>
    </article>
  );
}
