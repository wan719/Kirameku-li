import { BrainCircuit, Code2, ExternalLink, Sparkles } from "lucide-react";

import AboutContactActions from "@/components/about/AboutContactActions";
import { projectConfigs } from "@/config/projects";
import { getVisibleStatusSnapshotItems, siteBrand } from "@/config/site";

const focusAreas = [
  {
    title: "Java 全栈",
    description: "从服务端业务建模到前端交互，持续补齐可维护、可验证的完整工程链路。",
  },
  {
    title: "AI 工程",
    description: "关注 Agent、RAG 与真实业务场景的结合，也重视评估、边界和工程可靠性。",
  },
  {
    title: "HarmonyOS",
    description: "正在用 ArkTS 和 DevEco Studio 验证鸿蒙应用与 Agent 能力的最小闭环。",
  },
] as const;

export default function AboutPage() {
  const statusItems = getVisibleStatusSnapshotItems();

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 md:py-16 lg:px-8">
      <header className="max-w-3xl pb-12 md:pb-16">
        <div className="mb-4 flex items-center gap-3 text-violet-700 dark:text-violet-300">
          <Sparkles aria-hidden="true" className="h-6 w-6" />
          <span className="text-sm font-semibold">关于我</span>
        </div>
        <h1 className="text-3xl font-bold leading-tight text-slate-950 dark:text-white md:text-5xl">
          你好，我是{siteBrand.nickname}。
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600 dark:text-slate-300">
          我喜欢把模糊的想法变成能运行、能验证、也能继续维护的东西。在代码、灵感与生活之间寻找共鸣，也认真记录每一次迭代。
        </p>
      </header>

      <section className="border-t border-slate-200 py-12 dark:border-slate-700" aria-labelledby="identity-heading">
        <h2 id="identity-heading" className="text-2xl font-bold text-slate-950 dark:text-white">
          个人定位
        </h2>
        <p className="mt-4 max-w-3xl leading-8 text-slate-600 dark:text-slate-300">
          {siteBrand.identity}。当前更关注真实问题中的工程判断：先建立可信的可运行基线，再让产品表达与技术能力一起生长。
        </p>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {focusAreas.map((area) => (
            <article key={area.title} className="rounded-lg border border-slate-200 bg-white/65 p-5 dark:border-slate-700 dark:bg-slate-900/50">
              <Code2 aria-hidden="true" className="h-5 w-5 text-teal-700 dark:text-teal-300" />
              <h3 className="mt-4 text-lg font-bold text-slate-950 dark:text-white">{area.title}</h3>
              <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">{area.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="border-t border-slate-200 py-12 dark:border-slate-700" aria-labelledby="projects-heading">
        <h2 id="projects-heading" className="text-2xl font-bold text-slate-950 dark:text-white">
          三个代表项目
        </h2>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {projectConfigs.map((project) => (
            <article key={project.slug} className="rounded-lg border border-slate-200 bg-white/65 p-5 dark:border-slate-700 dark:bg-slate-900/50">
              <p className="text-xs font-semibold text-violet-700 dark:text-violet-300">{project.statusLabel}</p>
              <h3 className="mt-3 text-lg font-bold text-slate-950 dark:text-white">{project.title}</h3>
              <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">{project.summary}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="grid gap-10 border-t border-slate-200 py-12 dark:border-slate-700 md:grid-cols-[1.2fr_0.8fr]" aria-labelledby="workflow-heading">
        <div>
          <BrainCircuit aria-hidden="true" className="h-6 w-6 text-amber-600 dark:text-amber-300" />
          <h2 id="workflow-heading" className="mt-4 text-2xl font-bold text-slate-950 dark:text-white">
            ChatGPT + Codex + Obsidian 工作流
          </h2>
          <p className="mt-4 leading-8 text-slate-600 dark:text-slate-300">
            我用 ChatGPT 帮助澄清目标和复盘判断，用 Codex 在仓库中完成可验证的工程实施，再把长期有效的方法沉淀进 Obsidian。私人笔记始终保留在私有空间，只有经过审阅、适合公开的内容才会进入本站。
          </p>
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-950 dark:text-white">当前状态</h2>
          <dl className="mt-5 space-y-4">
            {statusItems.map((item) => (
              <div key={item.key} className="border-l-2 border-teal-500 pl-4">
                <dt className="text-xs font-semibold text-slate-500 dark:text-slate-400">{item.label}</dt>
                <dd className="mt-1 text-sm leading-6 text-slate-800 dark:text-slate-100">{item.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="border-t border-slate-200 py-12 dark:border-slate-700" aria-labelledby="contact-heading">
        <h2 id="contact-heading" className="text-2xl font-bold text-slate-950 dark:text-white">
          保持联系
        </h2>
        <p className="mt-4 max-w-2xl leading-8 text-slate-600 dark:text-slate-300">
          欢迎通过 GitHub 了解我的公开项目，或用邮件交流工程实践与学习方法。
        </p>
        <AboutContactActions github={siteBrand.github} email={siteBrand.email} />

        {siteBrand.resume.enabled && siteBrand.resume.url && (
          <a
            href={siteBrand.resume.url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 dark:border-slate-600 dark:text-slate-100"
          >
            查看简历
            <ExternalLink aria-hidden="true" className="h-4 w-4" />
          </a>
        )}
      </section>
    </main>
  );
}
