import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  Eye,
  FolderGit2,
  Headphones,
  Sparkles,
} from "lucide-react";

import {
  getProjectPrimaryAction,
  projectConfigs,
} from "@/config/projects";
import {
  homeModuleConfig,
  type HomePageData,
} from "@/config/home";
import {
  getVisibleStatusSnapshotItems,
  siteBrand,
} from "@/config/site";


const spiritPath = "/brand/illustrations/resonance-spirit.webp";

function formatPublishedDate(value: string | null) {
  if (!value) return "";
  const date = value.slice(0, 10);
  return /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : "";
}

export default function PersonalizedHome({
  data,
}: {
  data: HomePageData;
}) {
  const statusItems = getVisibleStatusSnapshotItems();

  return (
    <div className="min-w-0 overflow-x-clip">
      {homeModuleConfig.hero && (
        <section
          id="home-hero"
          className="relative min-h-[560px] overflow-hidden border-b border-teal-900/10 dark:border-violet-200/10 sm:min-h-[600px] lg:min-h-[640px]"
        >
          <Image
            src={spiritPath}
            alt="共鸣精灵，由月牙、星光与共鸣圆环组成"
            width={1003}
            height={1568}
            priority
            sizes="(max-width: 1023px) 280px, 480px"
            className="pointer-events-none absolute -bottom-16 right-[-72px] h-auto w-[270px] opacity-25 sm:right-[-36px] sm:w-[320px] lg:bottom-[-110px] lg:right-[max(2rem,calc((100vw-80rem)/2))] lg:w-[470px] lg:opacity-100"
          />
          <div className="relative z-10 mx-auto flex min-h-[560px] max-w-7xl items-center px-4 py-16 sm:min-h-[600px] sm:px-6 lg:min-h-[640px] lg:px-8">
            <div className="max-w-2xl pb-10 lg:pr-10">
              <Image
                src="/brand/logo-wordmark.svg"
                alt="Kirameku · 晚"
                width={300}
                height={67}
                className="site-brand-image mb-8 h-auto w-[220px] sm:w-[270px]"
              />
              <h1 className="text-4xl font-bold leading-tight text-slate-950 dark:text-white sm:text-5xl">
                {siteBrand.title}
              </h1>
              <p className="mt-5 max-w-xl font-serif text-xl leading-9 text-teal-800 dark:text-teal-200 sm:text-2xl">
                {siteBrand.subtitle}
              </p>
              <p className="mt-4 max-w-xl text-base leading-7 text-slate-600 dark:text-slate-300 sm:text-lg">
                {siteBrand.identity}
              </p>
              <div className="mt-9 flex flex-wrap gap-3">
                <Link
                  href="#featured-projects"
                  className="inline-flex min-h-11 items-center gap-2 rounded-md bg-teal-700 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-teal-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2 dark:bg-teal-500 dark:text-slate-950 dark:hover:bg-teal-400"
                >
                  查看项目
                  <ArrowRight aria-hidden="true" className="h-4 w-4" />
                </Link>
                <Link
                  href="/posts"
                  className="inline-flex min-h-11 items-center gap-2 rounded-md border border-slate-300 bg-white/70 px-5 py-2.5 text-sm font-semibold text-slate-800 transition-colors hover:border-teal-600 hover:text-teal-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 dark:border-slate-600 dark:bg-slate-900/70 dark:text-slate-100 dark:hover:border-teal-400 dark:hover:text-teal-200"
                >
                  阅读文章
                  <BookOpen aria-hidden="true" className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {homeModuleConfig.statusSnapshot && statusItems.length > 0 && (
        <section
          id="home-status"
          aria-labelledby="home-status-title"
          className="border-b border-teal-900/10 bg-white/35 dark:border-violet-200/10 dark:bg-slate-950/20"
        >
          <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
            <div className="mb-7 flex items-center gap-3">
              <Sparkles aria-hidden="true" className="h-5 w-5 text-violet-600 dark:text-violet-300" />
              <h2 id="home-status-title" className="text-xl font-bold text-slate-900 dark:text-white">
                状态快照
              </h2>
            </div>
            <dl className="grid gap-0 border-y border-slate-200 dark:border-slate-700 md:grid-cols-3">
              {statusItems.map((item) => (
                <div
                  key={item.key}
                  className="min-w-0 border-b border-slate-200 py-6 last:border-b-0 dark:border-slate-700 md:border-b-0 md:border-r md:px-7 md:first:pl-0 md:last:border-r-0 md:last:pr-0"
                >
                  <dt className="text-xs font-semibold text-teal-700 dark:text-teal-300">
                    {item.label}
                  </dt>
                  <dd className="mt-2 break-words text-base font-medium leading-7 text-slate-800 dark:text-slate-100">
                    {item.value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </section>
      )}

      {homeModuleConfig.featuredProjects && (
        <section id="featured-projects" aria-labelledby="featured-projects-title">
          <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-teal-700 dark:text-teal-300">持续构建</p>
                <h2 id="featured-projects-title" className="mt-2 text-3xl font-bold text-slate-950 dark:text-white">
                  重点项目
                </h2>
              </div>
              <Link href="/projects" className="site-footer-link inline-flex items-center gap-2 text-sm font-semibold">
                全部项目
                <ArrowRight aria-hidden="true" className="h-4 w-4" />
              </Link>
            </div>
            <div className="mt-9 grid gap-5 lg:grid-cols-3">
              {projectConfigs.map((project) => {
                const action = getProjectPrimaryAction(project);
                const content = (
                  <>
                    <div className="flex items-start justify-between gap-4">
                      <FolderGit2 aria-hidden="true" className="h-6 w-6 shrink-0 text-teal-700 dark:text-teal-300" />
                      <span className="rounded-sm border border-violet-300/70 px-2 py-1 text-xs font-semibold text-violet-700 dark:border-violet-400/30 dark:text-violet-200">
                        {project.statusLabel}
                      </span>
                    </div>
                    <h3 className="mt-7 text-xl font-bold text-slate-950 dark:text-white">
                      {project.title}
                    </h3>
                    <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
                      {project.summary}
                    </p>
                    <div className="mt-6 flex flex-wrap gap-2">
                      {project.techStack.slice(0, 4).map((tech) => (
                        <span key={tech} className="rounded-sm bg-slate-100 px-2 py-1 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                          {tech}
                        </span>
                      ))}
                    </div>
                    {action && (
                      <span className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-teal-700 dark:text-teal-300">
                        查看项目
                        <ArrowRight aria-hidden="true" className="h-4 w-4" />
                      </span>
                    )}
                  </>
                );
                const className = "block min-w-0 rounded-lg border border-slate-200 bg-white/65 p-6 shadow-sm transition-colors dark:border-slate-700 dark:bg-slate-900/55";
                return action ? (
                  <Link key={project.slug} href={action.href} className={`${className} hover:border-teal-500 dark:hover:border-teal-400`}>
                    {content}
                  </Link>
                ) : (
                  <article key={project.slug} className={className}>
                    {content}
                  </article>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {homeModuleConfig.articleEntry && (
        <section
          id="home-articles"
          aria-labelledby="home-articles-title"
          className="border-y border-teal-900/10 bg-slate-50/55 dark:border-violet-200/10 dark:bg-slate-950/25"
        >
          <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3">
              <BookOpen aria-hidden="true" className="h-6 w-6 text-violet-600 dark:text-violet-300" />
              <h2 id="home-articles-title" className="text-3xl font-bold text-slate-950 dark:text-white">
                文章入口
              </h2>
            </div>
            {data.posts.length > 0 ? (
              <div className="mt-9 grid gap-5 md:grid-cols-3">
                {data.posts.map((post) => (
                  <Link
                    key={post.id}
                    href={`/posts/${post.slug}`}
                    className="min-w-0 rounded-lg border border-slate-200 bg-white/70 p-6 transition-colors hover:border-teal-500 dark:border-slate-700 dark:bg-slate-900/60 dark:hover:border-teal-400"
                  >
                    <p className="text-xs font-semibold text-teal-700 dark:text-teal-300">
                      {formatPublishedDate(post.publishedAt)}
                    </p>
                    <h3 className="mt-3 break-words text-lg font-bold text-slate-950 dark:text-white">
                      {post.title}
                    </h3>
                    {post.description && (
                      <p className="mt-3 line-clamp-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
                        {post.description}
                      </p>
                    )}
                  </Link>
                ))}
              </div>
            ) : (
              <div className="mt-8 grid items-center gap-8 border-y border-slate-200 py-10 dark:border-slate-700 md:grid-cols-[140px_minmax(0,1fr)]">
                <div className="relative mx-auto h-32 w-28 overflow-hidden" aria-hidden="true">
                  <Image src={spiritPath} alt="" fill sizes="112px" className="object-contain" />
                </div>
                <div className="min-w-0">
                  <p className="max-w-2xl font-serif text-xl leading-9 text-slate-700 dark:text-slate-200">
                    这里会记录代码、灵感与成长，内容正在慢慢整理。
                  </p>
                  <div className="mt-6 flex flex-wrap gap-3">
                    <Link href="/projects" className="inline-flex min-h-11 items-center gap-2 rounded-md bg-teal-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-teal-800 dark:bg-teal-500 dark:text-slate-950 dark:hover:bg-teal-400">
                      查看项目
                      <ArrowRight aria-hidden="true" className="h-4 w-4" />
                    </Link>
                    <Link href="/about" className="inline-flex min-h-11 items-center rounded-md border border-slate-300 bg-white/65 px-5 py-2.5 text-sm font-semibold text-slate-800 hover:border-teal-600 dark:border-slate-600 dark:bg-slate-900/60 dark:text-slate-100 dark:hover:border-teal-400">
                      关于我
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {homeModuleConfig.siteInfo && (
        <section id="home-site-info" aria-labelledby="home-site-info-title">
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
            <h2 id="home-site-info-title" className="text-xl font-bold text-slate-950 dark:text-white">
              站点信息
            </h2>
            {data.siteStats ? (
              <dl className="mt-7 flex flex-wrap gap-x-12 gap-y-7 border-y border-slate-200 py-7 dark:border-slate-700">
                <div>
                  <dt className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                    <Eye aria-hidden="true" className="h-4 w-4" />
                    公开访问
                  </dt>
                  <dd className="mt-2 text-2xl font-bold text-slate-950 dark:text-white">
                    {data.siteStats.count}
                  </dd>
                </div>
                {data.siteStats.runningDays !== null && (
                  <div>
                    <dt className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                      <CalendarDays aria-hidden="true" className="h-4 w-4" />
                      运行时间
                    </dt>
                    <dd className="mt-2 text-2xl font-bold text-slate-950 dark:text-white">
                      {data.siteStats.runningDays} 天
                    </dd>
                  </div>
                )}
              </dl>
            ) : (
              <p className="mt-5 text-sm text-slate-500 dark:text-slate-400">
                公开统计暂不可用
              </p>
            )}
          </div>
        </section>
      )}

      {homeModuleConfig.musicStatus && (
        <section
          id="home-music-status"
          aria-labelledby="home-music-status-title"
          className="border-t border-teal-900/10 bg-white/30 dark:border-violet-200/10 dark:bg-slate-950/20"
        >
          <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-10 sm:px-6 lg:px-8">
            <Headphones aria-hidden="true" className="h-6 w-6 shrink-0 text-teal-700 dark:text-teal-300" />
            <div>
              <h2 id="home-music-status-title" className="text-base font-bold text-slate-900 dark:text-white">
                歌单整理中
              </h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                个人歌单尚未配置，当前不会请求旧歌单数据。
              </p>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
