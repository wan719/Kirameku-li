import assert from "node:assert/strict";
import test from "node:test";

import {
  getVisibleStatusSnapshotItems,
  siteBrand,
} from "../config/site.ts";
import {
  getProjectPrimaryAction,
  getProjectRepositoryUrl,
  projectConfigs,
  validateProjectConfigs,
} from "../config/projects.ts";


test("site brand contains only the locked public identity", () => {
  assert.equal(siteBrand.title, "Kirameku · 晚");
  assert.equal(siteBrand.nickname, "晚");
  assert.equal(siteBrand.github, "https://github.com/wan719");
  assert.equal(siteBrand.email, "3425446714@qq.com");
  assert.equal(siteBrand.phone, undefined);
  assert.equal(siteBrand.school, undefined);
  assert.equal(siteBrand.grade, undefined);
  assert.equal(siteBrand.resume.enabled, false);
  assert.equal(siteBrand.resume.url, "");
});

test("empty status snapshot values are hidden", () => {
  assert.deepEqual(
    getVisibleStatusSnapshotItems({
      current: "Building a synthetic demo",
      learning: "",
      next: "   ",
    }),
    [{ key: "current", label: "当前在做", value: "Building a synthetic demo" }],
  );
});

test("project config satisfies slug and repository constraints", () => {
  assert.doesNotThrow(() => validateProjectConfigs(projectConfigs));
  assert.equal(new Set(projectConfigs.map((project) => project.slug)).size, 3);

  for (const project of projectConfigs.filter(
    (item) => item.repositoryPublic,
  )) {
    assert.ok(getProjectRepositoryUrl(project));
  }
});

test("private SecondBrain config exposes no repository or destination", () => {
  const secondBrain = projectConfigs.find(
    (project) => project.slug === "second-brain",
  );

  assert.ok(secondBrain);
  assert.equal(secondBrain.repositoryPublic, false);
  assert.equal(secondBrain.repositoryUrl, undefined);
  assert.equal(secondBrain.detailUrl, undefined);
  assert.equal(secondBrain.demoUrl, undefined);
  assert.equal(getProjectPrimaryAction(secondBrain), null);
  assert.equal(getProjectRepositoryUrl(secondBrain), null);
});

test("primary project action prefers a valid demo over detail", () => {
  const project = {
    ...projectConfigs[0],
    demoUrl: "https://demo.example.test",
    detailUrl: "/projects/fallback-detail",
  };

  assert.deepEqual(getProjectPrimaryAction(project), {
    href: "https://demo.example.test",
    external: true,
  });
  assert.deepEqual(
    getProjectPrimaryAction({ ...project, demoUrl: "not-a-url" }),
    { href: "/projects/fallback-detail", external: false },
  );
  assert.equal(
    getProjectPrimaryAction({
      ...project,
      demoUrl: "",
      detailUrl: "",
    }),
    null,
  );
});
