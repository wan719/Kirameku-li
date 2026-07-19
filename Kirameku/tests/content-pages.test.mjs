import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import { siteBrand } from "../config/site.ts";

const root = new URL("../", import.meta.url);

test("posts empty state has the required copy and two destinations", async () => {
  const page = await readFile(new URL("app/posts/page.tsx", root), "utf8");

  assert.match(page, /这里会记录代码、灵感与成长，内容正在慢慢整理。/);
  assert.match(page, /href="\/projects"/);
  assert.match(page, /查看项目/);
  assert.match(page, /href="\/about"/);
  assert.match(page, /关于我/);
});

test("posts page never renders unfiltered category counts", async () => {
  const page = await readFile(new URL("app/posts/page.tsx", root), "utf8");

  assert.doesNotMatch(page, /cat\.post_count/);
  assert.match(page, /posts\.length > 0 && categories\.length > 0/);
});

test("about page contains the public profile structure and project workflow", async () => {
  const page = await readFile(new URL("app/about/page.tsx", root), "utf8");

  for (const content of [
    "个人定位",
    "Java 全栈",
    "AI 工程",
    "HarmonyOS",
    "代表项目",
    "ChatGPT",
    "Codex",
    "Obsidian",
    "当前状态",
    "projectConfigs",
  ]) {
    assert.match(page, new RegExp(content));
  }

  assert.match(page, /siteBrand\.resume\.enabled/);
  assert.doesNotMatch(page, /phone|school|grade/);
  assert.doesNotMatch(page, /about\.md|dangerouslySetInnerHTML/);
});

test("contact actions expose mailto and resilient clipboard feedback", async () => {
  const actions = await readFile(
    new URL("components/about/AboutContactActions.tsx", root),
    "utf8",
  );

  assert.match(actions, /`mailto:\$\{email\}`/);
  assert.match(actions, /navigator\.clipboard\.writeText\(email\)/);
  assert.match(actions, /Promise\.race/);
  assert.match(actions, /clipboard timeout/);
  assert.match(actions, /复制成功/);
  assert.match(actions, /复制失败/);
  assert.match(actions, /role="status"/);
  assert.match(actions, /aria-live="polite"/);
});

test("private profile fields and resume remain disabled by default", () => {
  assert.equal(siteBrand.phone, undefined);
  assert.equal(siteBrand.school, undefined);
  assert.equal(siteBrand.grade, undefined);
  assert.equal(siteBrand.resume.enabled, false);
  assert.equal(siteBrand.resume.url, "");
});
