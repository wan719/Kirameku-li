export type HomeModuleConfig = {
  hero: boolean;
  statusSnapshot: boolean;
  featuredProjects: boolean;
  articleEntry: boolean;
  siteInfo: boolean;
  musicStatus: boolean;
  chatters: boolean;
  photoWall: boolean;
  dogDiary: boolean;
  albums: boolean;
};

export type PublicSiteConfig = {
  contentVisibility: {
    posts: boolean;
    chatters: boolean;
    albums: boolean;
  };
  siteStats: {
    launchDateConfigured: boolean;
  };
};

export type HomePost = {
  id: number;
  slug: string;
  title: string;
  description: string;
  publishedAt: string | null;
};

export type HomeSiteStats = {
  count: number;
  launchDate: string | null;
  runningDays: number | null;
};

export type HomePageData = {
  publicConfig: PublicSiteConfig;
  posts: HomePost[];
  siteStats: HomeSiteStats | null;
};

type HomeFetchResponse = {
  ok: boolean;
  json: () => Promise<unknown>;
};

export type HomeFetch = (
  url: string,
  init?: { next?: { revalidate: number } },
) => Promise<HomeFetchResponse>;

export const homeModuleConfig = {
  hero: true,
  statusSnapshot: true,
  featuredProjects: true,
  articleEntry: true,
  siteInfo: true,
  musicStatus: true,
  chatters: false,
  photoWall: false,
  dogDiary: false,
  albums: false,
} as const satisfies HomeModuleConfig;

export const musicConfig = {
  playlistId: "",
  songIds: [] as readonly string[],
} as const;

const safePublicConfig: PublicSiteConfig = {
  contentVisibility: {
    posts: false,
    chatters: false,
    albums: false,
  },
  siteStats: {
    launchDateConfigured: false,
  },
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function parsePublicConfig(value: unknown): PublicSiteConfig | null {
  if (!isRecord(value)) return null;
  const visibility = value.contentVisibility;
  const stats = value.siteStats;
  if (!isRecord(visibility) || !isRecord(stats)) return null;
  if (
    typeof visibility.posts !== "boolean" ||
    typeof visibility.chatters !== "boolean" ||
    typeof visibility.albums !== "boolean" ||
    typeof stats.launchDateConfigured !== "boolean"
  ) {
    return null;
  }
  return {
    contentVisibility: {
      posts: visibility.posts,
      chatters: visibility.chatters,
      albums: visibility.albums,
    },
    siteStats: {
      launchDateConfigured: stats.launchDateConfigured,
    },
  };
}

function parsePosts(value: unknown): HomePost[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) => {
    if (
      !isRecord(item) ||
      typeof item.id !== "number" ||
      typeof item.slug !== "string" ||
      typeof item.title !== "string"
    ) {
      return [];
    }
    return [{
      id: item.id,
      slug: item.slug,
      title: item.title,
      description: typeof item.description === "string" ? item.description : "",
      publishedAt:
        typeof item.published_at === "string" ? item.published_at : null,
    }];
  });
}

function parseSiteStats(value: unknown): HomeSiteStats | null {
  if (!isRecord(value) || typeof value.count !== "number") return null;
  return {
    count: Math.max(0, Math.trunc(value.count)),
    launchDate: typeof value.launchDate === "string" ? value.launchDate : null,
    runningDays:
      typeof value.runningDays === "number"
        ? Math.max(0, Math.trunc(value.runningDays))
        : null,
  };
}

async function readJson(
  fetcher: HomeFetch,
  url: string,
): Promise<unknown> {
  const response = await fetcher(url, { next: { revalidate: 60 } });
  if (!response.ok) throw new Error("public home request failed");
  return response.json();
}

export async function loadHomePageData(
  fetcher: HomeFetch = fetch as HomeFetch,
  apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000",
): Promise<HomePageData> {
  const base = apiBase.replace(/\/$/, "");
  let publicConfig: PublicSiteConfig;
  try {
    const rawConfig = await readJson(fetcher, `${base}/api/site/public-config`);
    const parsedConfig = parsePublicConfig(rawConfig);
    if (!parsedConfig) throw new Error("invalid public config");
    publicConfig = parsedConfig;
  } catch {
    return {
      publicConfig: safePublicConfig,
      posts: [],
      siteStats: null,
    };
  }

  const postsPromise = publicConfig.contentVisibility.posts
    ? readJson(
        fetcher,
        `${base}/api/posts?status=published&page=1&size=3`,
      ).then(parsePosts).catch(() => [])
    : Promise.resolve([] as HomePost[]);
  const statsPromise = readJson(fetcher, `${base}/api/visitors/count`)
    .then(parseSiteStats)
    .catch(() => null);
  const [posts, siteStats] = await Promise.all([postsPromise, statsPromise]);

  return { publicConfig, posts, siteStats };
}
