"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  FolderGit2,
  Home,
  Menu,
  Moon,
  Sun,
  User,
  X,
} from "lucide-react";

import { navigationItems } from "@/config/navigation";
import { useTheme } from "@/components/providers/ThemeProvider";


const navigationIcons = {
  "/": Home,
  "/projects": FolderGit2,
  "/posts": BookOpen,
  "/about": User,
} as const;

export default function Navbar() {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!isMobileMenuOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsMobileMenuOpen(false);
    };
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [isMobileMenuOpen]);

  if (pathname.startsWith("/garden")) return null;

  return (
    <header className="site-header fixed inset-x-0 top-0 z-50 h-[72px] border-b">
      <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          aria-label="Kirameku · 晚首页"
          className="rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2"
        >
          <Image
            src="/brand/logo-wordmark.svg"
            alt="Kirameku · 晚"
            width={180}
            height={40}
            priority
            className="site-brand-image hidden h-10 w-auto sm:block"
          />
          <Image
            src="/brand/logo-icon.svg"
            alt="Kirameku · 晚"
            width={40}
            height={40}
            priority
            className="site-brand-image h-10 w-10 sm:hidden"
          />
        </Link>

        <nav aria-label="主导航" className="hidden items-center gap-1 md:flex">
          {navigationItems.map((item) => {
            const Icon = navigationIcons[item.href];
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={`site-nav-link flex h-10 items-center gap-2 rounded-md px-3 text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 ${
                  isActive ? "is-active" : ""
                }`}
              >
                <Icon aria-hidden="true" className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={theme === "dark" ? "切换到浅色主题" : "切换到深色主题"}
            title={theme === "dark" ? "切换到浅色主题" : "切换到深色主题"}
            className="site-icon-button flex h-10 w-10 items-center justify-center rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
          >
            {theme === "dark" ? (
              <Sun aria-hidden="true" className="h-5 w-5" />
            ) : (
              <Moon aria-hidden="true" className="h-5 w-5" />
            )}
          </button>
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen((open) => !open)}
            aria-label={isMobileMenuOpen ? "关闭导航菜单" : "打开导航菜单"}
            aria-controls="mobile-site-navigation"
            aria-expanded={isMobileMenuOpen}
            className="site-icon-button flex h-10 w-10 items-center justify-center rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 md:hidden"
          >
            {isMobileMenuOpen ? (
              <X aria-hidden="true" className="h-5 w-5" />
            ) : (
              <Menu aria-hidden="true" className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div
          id="mobile-site-navigation"
          className="site-mobile-drawer absolute inset-x-0 top-[72px] border-b px-4 py-3 md:hidden"
        >
          <nav aria-label="移动端主导航" className="mx-auto grid max-w-7xl gap-1">
            {navigationItems.map((item) => {
              const Icon = navigationIcons[item.href];
              const isActive =
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  aria-current={isActive ? "page" : undefined}
                  className={`site-nav-link flex min-h-11 items-center gap-3 rounded-md px-3 py-2 text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 ${
                    isActive ? "is-active" : ""
                  }`}
                >
                  <Icon aria-hidden="true" className="h-5 w-5" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      )}
    </header>
  );
}
