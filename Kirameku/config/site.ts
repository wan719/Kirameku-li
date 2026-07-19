export type StatusSnapshot = {
  current: string;
  learning: string;
  next: string;
};

export type SiteBrandConfig = {
  title: string;
  nickname: string;
  subtitle: string;
  identity: string;
  github: string;
  email: string;
  phone?: string;
  school?: string;
  grade?: string;
  resume: {
    enabled: boolean;
    url: string;
  };
  statusSnapshot: StatusSnapshot;
};

export const siteBrand = {
  title: "Kirameku · 晚",
  nickname: "晚",
  subtitle: "在代码、灵感与生活之间寻找共鸣",
  identity: "晚｜软件工程学生｜Java 全栈与 AI 工程方向",
  github: "https://github.com/wan719",
  email: "3425446714@qq.com",
  phone: undefined,
  school: undefined,
  grade: undefined,
  resume: {
    enabled: false,
    url: "",
  },
  statusSnapshot: {
    current: "InternPilot 鸿蒙求职 Agent 最小 Demo",
    learning: "HarmonyOS、ArkTS 与 Agent 工程化",
    next: "整理 SecondBrain 工作流文章",
  },
} as const satisfies SiteBrandConfig;

const statusLabels = {
  current: "当前在做",
  learning: "正在学习",
  next: "下一步计划",
} as const;

export function getVisibleStatusSnapshotItems(
  snapshot: StatusSnapshot = siteBrand.statusSnapshot,
) {
  return (Object.keys(statusLabels) as Array<keyof StatusSnapshot>)
    .map((key) => ({
      key,
      label: statusLabels[key],
      value: snapshot[key].trim(),
    }))
    .filter((item) => item.value.length > 0);
}
