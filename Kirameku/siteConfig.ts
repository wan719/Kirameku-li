import { siteBrand } from "@/config/site";

// 旧页面兼容层；新的身份与状态内容统一从 config/site.ts 读取。

export const siteConfig = {
  // 网站标题与博主信息
  title: siteBrand.title,
  url: "",
  authorName: siteBrand.nickname,
  bio: `${siteBrand.subtitle}。${siteBrand.identity}`,

  // 头像设置
  avatarUrl: "/brand/logo-icon.svg",

  // 背景设置
  useGradient: false,
  themeColors: ["#a18cd1", "#fbc2eb", "#a1c4fd", "#c2e9fb"],
  bgImages: [] as string[],

  // 默认封面图
  defaultPostCover: "/brand/projects/intern-pilot-harmonyos-agent.webp",

  // 照片墙预览图
  photoWallImage: "",

  // 云音乐配置（网易云音乐）
  // 填歌单 ID 则自动拉取整个歌单，填歌曲 ID 列表则只播放指定歌曲
  cloudMusicPlaylistId: "",             // 未配置时不请求歌单
  cloudMusicIds: [] as string[],         // 歌曲 ID 列表（歌单为空时使用）

  // 后端 API 地址（留空，开发通过 next.config.ts rewrites 代理，生产通过 Nginx 反代）
  apiBaseUrl: "",

  // 社交链接
  social: {
    github: siteBrand.github,
    gitee: "",
    google: `mailto:${siteBrand.email}`,
    email: siteBrand.email,
    qq: "",
    wechat: "",
  },

  // 站点信息
  buildDate: "",
  footerBadges: [
    { name: "Next.js 15", color: "text-sky-500" },
    { name: "React 19", color: "text-cyan-400" },
    { name: "Tailwind 4", color: "text-teal-400" },
  ],
  icpConfig: {
    name: "",
    link: "",
  },
  moeIcpConfig: {
    name: "",
    link: "",
  },

  // 分类标题
  chatterTitle: "留言",
  chatterDescription: "生活、技术、随想的碎片记录",
};
