export type ProjectStatus =
  | "live-iterating"
  | "minimum-demo-validating"
  | "article-preparing";

export type ProjectConfig = {
  slug: string;
  title: string;
  summary: string;
  background: string;
  problem: string;
  status: ProjectStatus;
  statusLabel: string;
  cover: string;
  techStack: readonly string[];
  capabilities: readonly string[];
  milestones: readonly string[];
  nextSteps: readonly string[];
  demoUrl?: string;
  detailUrl?: string;
  repositoryUrl?: string;
  repositoryPublic: boolean;
};

export type ProjectPrimaryAction = {
  href: string;
  external: boolean;
};

function isValidExternalUrl(value?: string): value is string {
  if (!value?.trim()) return false;
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

function isValidInternalUrl(value?: string): value is string {
  return Boolean(value?.startsWith("/") && !value.startsWith("//"));
}

export function getProjectPrimaryAction(
  project: ProjectConfig,
): ProjectPrimaryAction | null {
  if (isValidExternalUrl(project.demoUrl)) {
    return { href: project.demoUrl, external: true };
  }
  if (isValidInternalUrl(project.detailUrl)) {
    return { href: project.detailUrl, external: false };
  }
  return null;
}

export function getProjectRepositoryUrl(project: ProjectConfig): string | null {
  if (!project.repositoryPublic || !isValidExternalUrl(project.repositoryUrl)) {
    return null;
  }
  return project.repositoryUrl;
}

export function validateProjectConfigs(
  projects: readonly ProjectConfig[],
): void {
  const slugs = new Set<string>();
  for (const project of projects) {
    if (slugs.has(project.slug)) {
      throw new Error(`项目 slug 重复：${project.slug}`);
    }
    slugs.add(project.slug);

    if (project.repositoryPublic && !getProjectRepositoryUrl(project)) {
      throw new Error(`公开仓库项目缺少有效 repositoryUrl：${project.slug}`);
    }
    if (!project.repositoryPublic && project.repositoryUrl) {
      throw new Error(`私有仓库项目不得公开 repositoryUrl：${project.slug}`);
    }
    if (project.demoUrl && !isValidExternalUrl(project.demoUrl)) {
      throw new Error(`项目 demoUrl 无效：${project.slug}`);
    }
    if (project.detailUrl && !isValidInternalUrl(project.detailUrl)) {
      throw new Error(`项目 detailUrl 无效：${project.slug}`);
    }
  }

  const secondBrain = projects.find((project) => project.slug === "second-brain");
  if (
    !secondBrain ||
    secondBrain.repositoryPublic ||
    secondBrain.repositoryUrl ||
    secondBrain.detailUrl ||
    secondBrain.demoUrl
  ) {
    throw new Error("SecondBrain 必须保持私有且不可点击");
  }
}

export const projectConfigs = [
  {
    slug: "intern-pilot",
    title: "InternPilot",
    summary: "面向求职过程整理与复盘的个人项目，已上线并持续迭代。",
    background: "把分散的求职准备、过程记录与阶段复盘收拢到一条可持续维护的工作流中。",
    problem: "求职信息容易散落在不同工具里，进度、材料和复盘之间缺少连续上下文。",
    status: "live-iterating",
    statusLabel: "已上线 · 持续迭代",
    cover: "/brand/projects/intern-pilot.webp",
    techStack: ["Java", "Web", "AI 协作"],
    capabilities: ["求职流程整理", "阶段进度记录", "复盘信息沉淀"],
    milestones: ["公开仓库已建立", "可用版本已上线"],
    nextSteps: ["持续校准求职工作流", "完善项目实践说明"],
    detailUrl: "/projects/intern-pilot",
    repositoryUrl: "https://github.com/wan719/intern-pilot",
    repositoryPublic: true,
  },
  {
    slug: "intern-pilot-harmonyos-agent",
    title: "InternPilot 鸿蒙求职 Agent",
    summary: "围绕 HarmonyOS 与 ArkTS 探索的求职 Agent 最小 Demo，当前处于验证阶段。",
    background: "以 InternPilot 的求职场景为基础，验证 Agent 能力在 HarmonyOS 端的最小落地路径。",
    problem: "需要先验证 DevEco、ArkTS 与 Agent 服务之间的端到端链路，而不是提前包装成完整产品。",
    status: "minimum-demo-validating",
    statusLabel: "最小 Demo 验证中",
    cover: "/brand/projects/intern-pilot-harmonyos-agent.webp",
    techStack: ["HarmonyOS", "ArkTS", "DevEco Studio", "Agent"],
    capabilities: ["最小交互闭环", "Agent 能力接入验证", "鸿蒙端体验探索"],
    milestones: ["公开仓库已建立", "最小 Demo 方案已锁定"],
    nextSteps: ["完成端到端 Demo 验证", "记录工程化边界与复盘"],
    detailUrl: "/projects/intern-pilot-harmonyos-agent",
    repositoryUrl: "https://github.com/wan719/InternPilot-HarmonyOS-Agent",
    repositoryPublic: true,
  },
  {
    slug: "second-brain",
    title: "SecondBrain 知识库",
    summary: "用于沉淀学习、项目与 AI 协作方法的私人知识工作流，公开文章正在整理。",
    background: "长期笔记保留在私有空间，只把适合公开复用的方法整理成经过审核的文章。",
    problem: "知识沉淀需要兼顾长期可维护性、公开表达与个人隐私边界。",
    status: "article-preparing",
    statusLabel: "文章整理中",
    cover: "/brand/projects/second-brain.webp",
    techStack: ["Obsidian", "Markdown", "ChatGPT", "Codex"],
    capabilities: ["知识分类沉淀", "AI 协作工作流", "公开与私有边界管理"],
    milestones: ["私有工作流持续使用", "安全草稿导入能力已建立"],
    nextSteps: ["整理公开文章", "完成内容审核后再开放入口"],
    repositoryPublic: false,
  },
] as const satisfies readonly ProjectConfig[];

validateProjectConfigs(projectConfigs);
