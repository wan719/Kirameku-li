import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";

const read = path =>
  readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

test("uses the Kirameku Wan identity in browser and platform metadata", () => {
  const config = JSON.parse(read("public/platform-config.json"));
  const index = read("index.html");

  assert.equal(config.Title, "Kirameku · 晚");
  assert.match(index, /<html lang="zh-CN">/);
  assert.match(index, /<title>Kirameku · 晚<\/title>/);
  assert.match(index, /rel="icon" href="\/favicon\.svg"/);
});

test("uses the new logo on login and in the sidebar", () => {
  const login = read("src/views/login/index.vue");
  const loginAssets = read("src/views/login/utils/static.ts");
  const navigation = read("src/layout/hooks/useNav.ts");

  assert.match(login, /alt="Kirameku · 晚"/);
  assert.match(loginAssets, /logo\.svg/);
  assert.match(navigation, /logo\.svg/);
  assert.ok(existsSync(new URL("../public/logo.svg", import.meta.url)));
  assert.ok(existsSync(new URL("../public/favicon.svg", import.meta.url)));
});

test("does not ship legacy personal avatars or login-page account links", () => {
  const login = read("src/views/login/index.vue");

  assert.doesNotMatch(login, /github\.com\/pure-admin/i);
  assert.doesNotMatch(
    login,
    /默认(?:管理员|账号|密码)|default\s+(?:admin|password)/i
  );
  assert.equal(
    existsSync(new URL("../public/icon.png", import.meta.url)),
    false
  );
  assert.equal(
    existsSync(new URL("../src/assets/user.jpg", import.meta.url)),
    false
  );
});

test("keeps unauthenticated admin routes behind the login guard", () => {
  const router = read("src/router/index.ts");

  assert.match(router, /const whiteList = \["\/login"\]/);
  assert.match(router, /router\.beforeEach\(/);
  assert.match(router, /if \(to\.path !== "\/login"\)/);
  assert.match(router, /removeToken\(\);\s*return \{ path: "\/login" \};/s);
});
