import assert from "node:assert/strict";
import { readFile, stat } from "node:fs/promises";
import test from "node:test";

import {
  getProjectDetailConfig,
  projectConfigs,
  projectDetailSlugs,
} from "../config/projects.ts";


const root = new URL("../", import.meta.url);

test("only the two public projects have detail routes", () => {
  assert.deepEqual(projectDetailSlugs, [
    "intern-pilot",
    "intern-pilot-harmonyos-agent",
  ]);
  assert.equal(getProjectDetailConfig("intern-pilot")?.statusLabel, "已上线 · 持续迭代");
  assert.equal(
    getProjectDetailConfig("intern-pilot-harmonyos-agent")?.statusLabel,
    "最小 Demo 验证中",
  );
  assert.equal(getProjectDetailConfig("second-brain"), null);
  assert.equal(getProjectDetailConfig("unknown-project"), null);
});

test("detail projects contain every shared template data set", () => {
  for (const slug of projectDetailSlugs) {
    const project = getProjectDetailConfig(slug);
    assert.ok(project);
    assert.ok(project.background.length > 0);
    assert.ok(project.problem.length > 0);
    assert.ok(project.techStack.length > 0);
    assert.ok(project.capabilities.length > 0);
    assert.ok(project.milestones.length > 0);
    assert.ok(project.developmentHistory.length > 0);
    assert.ok(project.nextSteps.length > 0);
    assert.equal(project.detailUrl, `/projects/${slug}`);
  }
});

test("project cover files exist and are nontrivial WebP assets", async () => {
  for (const project of projectConfigs) {
    const cover = await stat(new URL(`public${project.cover}`, root));
    assert.ok(cover.size > 10_000, `${project.slug} cover is missing or too small`);
  }
});

test("project pages share config, return 404 for unknown slugs, and secure links", async () => {
  const [listPage, routePage, card, detail] = await Promise.all([
    readFile(new URL("app/projects/page.tsx", root), "utf8"),
    readFile(new URL("app/projects/[slug]/page.tsx", root), "utf8"),
    readFile(new URL("components/projects/ProjectCard.tsx", root), "utf8"),
    readFile(new URL("components/projects/ProjectDetail.tsx", root), "utf8"),
  ]);

  assert.match(listPage, /projectConfigs\.map/);
  assert.match(routePage, /generateStaticParams/);
  assert.match(routePage, /getProjectDetailConfig/);
  assert.match(routePage, /notFound\(\)/);
  assert.doesNotMatch(routePage, /fetch\(/);

  for (const heading of [
    "项目背景",
    "解决的问题",
    "技术栈",
    "核心能力",
    "当前进度",
    "开发历程",
    "后续计划",
  ]) {
    assert.match(detail, new RegExp(heading));
  }

  assert.match(card, /getProjectPrimaryAction/);
  assert.match(card, /getProjectRepositoryUrl/);
  assert.match(card, /target="_blank"/);
  assert.match(card, /rel="noopener noreferrer"/);
  assert.match(card, /unoptimized/);
  assert.match(detail, /unoptimized/);
});
