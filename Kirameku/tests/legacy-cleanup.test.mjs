import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

const appRoot = new URL("../", import.meta.url);
const repoRoot = new URL("../../", import.meta.url);

async function exists(url) {
  try {
    await access(url);
    return true;
  } catch {
    return false;
  }
}

test("disabled public moments and album routes terminate with notFound", async () => {
  const [moments, photoWall] = await Promise.all([
    readFile(new URL("app/moments/page.tsx", appRoot), "utf8"),
    readFile(new URL("app/photowall/page.tsx", appRoot), "utf8"),
  ]);

  for (const page of [moments, photoWall]) {
    assert.match(page, /notFound\(\)/);
    assert.doesNotMatch(page, /getChatters|getAlbums|data\/photos|data\/moments/);
  }
});

test("legacy public widgets and radial navigation are no longer mounted", async () => {
  const [layout, widgets] = await Promise.all([
    readFile(new URL("app/layout.tsx", appRoot), "utf8"),
    readFile(new URL("components/layout/ClientWidgets.tsx", appRoot), "utf8"),
  ]);

  assert.doesNotMatch(layout, /RadialMenu/);
  assert.match(widgets, /FloatingPlayer/);
  assert.doesNotMatch(widgets, /Live2D|Toolbox|GamesPanel/);
});

test("personal and unlicensed legacy asset trees are removed", async () => {
  for (const path of [
    "public/live2d",
    "public/images",
    "components/widgets/Live2D.tsx",
    "components/ui/RadialMenu.tsx",
    "app/HomeClient.tsx",
    "components/home/LatestChatterCarousel.tsx",
    "components/home/PhotoWallPreview.tsx",
    "app/about/about.md",
    "data/moments.ts",
    "data/photos.ts",
  ]) {
    assert.equal(await exists(new URL(path, appRoot)), false, `${path} still exists`);
  }

  assert.equal(await exists(new URL("项目图片", repoRoot)), false);
});

test("music remains configurable but has a safe unconfigured state", async () => {
  const [homeConfig, provider, musicPage, compatibilityConfig] = await Promise.all([
    readFile(new URL("config/home.ts", appRoot), "utf8"),
    readFile(new URL("components/providers/MusicProvider.tsx", appRoot), "utf8"),
    readFile(new URL("app/music/page.tsx", appRoot), "utf8"),
    readFile(new URL("siteConfig.ts", appRoot), "utf8"),
  ]);

  assert.match(homeConfig, /playlistId:\s*""/);
  assert.match(homeConfig, /songIds:\s*\[\]/);
  assert.match(provider, /musicConfig\.playlistId/);
  assert.match(provider, /musicConfig\.songIds/);
  assert.match(musicPage, /歌单整理中/);
  assert.doesNotMatch(compatibilityConfig, /\/images\//);
});

test("admin chatter and album management remain in place", async () => {
  for (const path of [
    "Kirameku-backend/admin/src/api/chatter.ts",
    "Kirameku-backend/admin/src/api/album.ts",
    "Kirameku-backend/admin/src/views/chatter/index.vue",
    "Kirameku-backend/admin/src/views/album/index.vue",
  ]) {
    assert.equal(await exists(new URL(path, repoRoot)), true, `${path} was removed`);
  }
});
