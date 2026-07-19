import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import {
  homeModuleConfig,
  loadHomePageData,
  musicConfig,
} from "../config/home.ts";


const root = new URL("../", import.meta.url);

function jsonResponse(value, ok = true) {
  return {
    ok,
    async json() {
      return value;
    },
  };
}

test("homepage modules default to the six locked sections", () => {
  assert.deepEqual(homeModuleConfig, {
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
  });
  assert.deepEqual(musicConfig, { playlistId: "", songIds: [] });
});

test("backend failure falls back to no public content without legacy requests", async () => {
  const calls = [];
  const data = await loadHomePageData(async (url) => {
    calls.push(url);
    throw new Error("backend unavailable");
  }, "http://backend.invalid");

  assert.deepEqual(calls, ["http://backend.invalid/api/site/public-config"]);
  assert.deepEqual(data.publicConfig.contentVisibility, {
    posts: false,
    chatters: false,
    albums: false,
  });
  assert.deepEqual(data.posts, []);
  assert.equal(data.siteStats, null);
});

test("allowlisted posts remain visible while the global switch is closed", async () => {
  const calls = [];
  const data = await loadHomePageData(async (url) => {
    calls.push(url);
    if (url.endsWith("/api/site/public-config")) {
      return jsonResponse({
        contentVisibility: { posts: false, chatters: false, albums: false },
        siteStats: { launchDateConfigured: false },
      });
    }
    if (url.endsWith("/api/visitors/count")) {
      return jsonResponse({ code: 0, count: 7, launchDate: null, runningDays: null });
    }
    if (url.includes("/api/posts?")) {
      return jsonResponse([
        {
          id: 1,
          slug: "allowlisted-note",
          title: "Allowlisted note",
          description: "Visible through the shared backend predicate",
          published_at: "2026-07-19T00:00:00",
        },
      ]);
    }
    throw new Error(`unexpected request: ${url}`);
  }, "http://backend.invalid");

  assert.equal(data.posts.length, 1);
  assert.equal(data.posts[0].slug, "allowlisted-note");
  assert.equal(data.siteStats?.count, 7);
  assert.deepEqual(calls, [
    "http://backend.invalid/api/site/public-config",
    "http://backend.invalid/api/posts?status=published&page=1&size=3",
    "http://backend.invalid/api/visitors/count",
  ]);
  assert.ok(calls.every((url) => !/chatters|albums|music|site-config/.test(url)));
});

test("enabled public posts load only the public list", async () => {
  const calls = [];
  const data = await loadHomePageData(async (url) => {
    calls.push(url);
    if (url.endsWith("/api/site/public-config")) {
      return jsonResponse({
        contentVisibility: { posts: true, chatters: false, albums: false },
        siteStats: { launchDateConfigured: true },
      });
    }
    if (url.includes("/api/posts?")) {
      return jsonResponse([
        {
          id: 1,
          slug: "public-note",
          title: "Public note",
          description: "A safe public summary",
          published_at: "2026-07-19T00:00:00",
        },
      ]);
    }
    if (url.endsWith("/api/visitors/count")) {
      return jsonResponse({ code: 0, count: 9, launchDate: "2026-07-01", runningDays: 18 });
    }
    throw new Error(`unexpected request: ${url}`);
  }, "http://backend.invalid");

  assert.equal(data.posts.length, 1);
  assert.equal(data.posts[0].slug, "public-note");
  assert.equal(data.siteStats?.runningDays, 18);
  assert.ok(calls.some((url) => url.includes("/api/posts?status=published")));
});

test("homepage source follows the locked order and excludes legacy modules", async () => {
  const [page, home, musicProvider, legacySiteConfig] = await Promise.all([
    readFile(new URL("app/page.tsx", root), "utf8"),
    readFile(new URL("components/home/PersonalizedHome.tsx", root), "utf8"),
    readFile(new URL("components/providers/MusicProvider.tsx", root), "utf8"),
    readFile(new URL("siteConfig.ts", root), "utf8"),
  ]);

  assert.match(page, /loadHomePageData/);
  const sectionIds = [
    "home-hero",
    "home-status",
    "featured-projects",
    "home-articles",
    "home-site-info",
    "home-music-status",
  ];
  let previousIndex = -1;
  for (const sectionId of sectionIds) {
    const index = home.indexOf(`id="${sectionId}"`);
    assert.ok(index > previousIndex, `${sectionId} must follow the locked order`);
    previousIndex = index;
  }

  assert.match(home, /这里会记录代码、灵感与成长，内容正在慢慢整理。/);
  assert.match(home, /projectConfigs\.map/);
  assert.match(home, /resonance-sprite\.webp/);
  assert.doesNotMatch(home, /LatestChatterCarousel|PhotoWallPreview|DogDiary|CloudPlayer|LyricBar/);
  assert.match(musicProvider, /musicConfig/);
  assert.doesNotMatch(musicProvider, /\/api\/site-config/);
  assert.doesNotMatch(legacySiteConfig, /17943739323/);
});
