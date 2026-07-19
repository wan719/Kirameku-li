import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import { navigationItems } from "../config/navigation.ts";
import {
  THEME_STORAGE_KEY,
  resolveTheme,
} from "../config/theme.ts";


const root = new URL("../", import.meta.url);

test("primary navigation follows the locked order", () => {
  assert.deepEqual(
    navigationItems.map(({ href, label }) => ({ href, label })),
    [
      { href: "/", label: "首页" },
      { href: "/projects", label: "项目" },
      { href: "/posts", label: "文章" },
      { href: "/about", label: "关于" },
    ],
  );
});

test("theme defaults to system and accepts only saved light or dark values", () => {
  assert.equal(THEME_STORAGE_KEY, "kirameku-theme");
  assert.equal(resolveTheme(null, false), "light");
  assert.equal(resolveTheme(null, true), "dark");
  assert.equal(resolveTheme("dark", false), "dark");
  assert.equal(resolveTheme("light", true), "light");
  assert.equal(resolveTheme("unexpected", true), "dark");
});

test("brand assets are original vectors without embedded external images", async () => {
  const vectorPaths = [
    "public/brand/logo-icon.svg",
    "public/brand/logo-wordmark.svg",
    "public/favicon.svg",
  ];

  for (const path of vectorPaths) {
    const source = await readFile(new URL(path, root), "utf8");
    assert.match(source, /<title(?:\s[^>]*)?>Kirameku · 晚/);
    assert.doesNotMatch(
      source,
      /<image\b|(?:href|src)=["']https?:\/\/|@font-face/i,
    );
  }

  const ico = await readFile(new URL("public/favicon.ico", root));
  assert.ok(ico.byteLength > 100);
});

test("root shell wires branded metadata, footer, and reduced motion", async () => {
  const [layout, navbar, styles] = await Promise.all([
    readFile(new URL("app/layout.tsx", root), "utf8"),
    readFile(new URL("components/layout/Navbar.tsx", root), "utf8"),
    readFile(new URL("app/globals.css", root), "utf8"),
  ]);

  assert.match(layout, /siteBrand\.title/);
  assert.match(layout, /favicon\.svg/);
  assert.match(layout, /<Footer \/>/);
  assert.match(navbar, /site-brand-image/);
  assert.match(styles, /\.dark \.site-brand-image/);
  assert.match(styles, /prefers-reduced-motion:\s*reduce/);
});
