import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const readme = readFileSync(new URL("../../README.md", import.meta.url), "utf8");

test("documents the personalized project identity and highlights", () => {
  assert.match(readme, /# Kirameku · 晚/);
  assert.match(readme, /InternPilot/);
  assert.match(readme, /InternPilot HarmonyOS Agent/);
  assert.match(readme, /SecondBrain/);
  assert.doesNotMatch(readme, /从零搭建/);
});

test("documents the private-by-default public content policy", () => {
  for (const name of [
    "PUBLIC_POSTS_ENABLED",
    "PUBLIC_POST_SLUG_ALLOWLIST",
    "PUBLIC_CHATTERS_ENABLED",
    "PUBLIC_ALBUMS_ENABLED",
    "PUBLIC_STATS_NAMESPACE",
    "SITE_LAUNCH_DATE"
  ]) {
    assert.match(readme, new RegExp(`\\b${name}\\b`));
  }
  assert.match(readme, /默认关闭/);
});

test("documents runnable admin and draft workflows without default credentials", () => {
  assert.match(readme, /python -m app\.scripts\.create_admin/);
  assert.match(readme, /python -m app\.scripts\.import_post_draft/);
  assert.doesNotMatch(readme, /默认(?:管理员|账号|密码)/);
});

test("preserves explicit upstream attribution", () => {
  assert.match(readme, /## Upstream attribution/);
  assert.match(readme, /https:\/\/github\.com\/Xinghongia\/Kirameku/);
  assert.match(readme, /personalized fork and continued development of Kirameku/);
  assert.match(readme, /LICENSE/);
});

test("does not expose a private SecondBrain repository path", () => {
  assert.doesNotMatch(readme, /SecondBrain[^\n]*(?:[A-Z]:\\|\.\.\/|github\.com\/[^\s)]+\/second[-_]?brain)/i);
});
