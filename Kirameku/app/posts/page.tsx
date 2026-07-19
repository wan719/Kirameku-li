"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, BookOpen, Loader2, UserRound } from "lucide-react";
import Link from "next/link";

import { getCategories, getPosts, type CategoryItem } from "@/app/api";
import PostCard, { type PostOut } from "@/components/posts/PostCard";

const pageSize = 12;

export default function PostsPage() {
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [posts, setPosts] = useState<PostOut[]>([]);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  useEffect(() => {
    queueMicrotask(() => setLoading(true));
    getPosts({
      status: "published",
      page: 1,
      size: pageSize,
      ...(activeCategory ? { category: activeCategory } : {}),
    })
      .then((data) => {
        setPosts(data);
        setHasMore(data.length === pageSize);
      })
      .catch(() => {
        setPosts([]);
        setHasMore(false);
      })
      .finally(() => setLoading(false));
  }, [activeCategory]);

  useEffect(() => {
    if (posts.length === 0 || categories.length > 0) return;

    getCategories()
      .then((data) => {
        setCategories([...data].sort((a, b) => a.sort - b.sort));
      })
      .catch(() => setCategories([]));
  }, [categories.length, posts.length]);

  const selectCategory = (category: string | null) => {
    setPage(1);
    setActiveCategory(category);
  };

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setLoading(true);
    getPosts({
      status: "published",
      page: nextPage,
      size: pageSize,
      ...(activeCategory ? { category: activeCategory } : {}),
    })
      .then((data) => {
        setPosts((current) => [...current, ...data]);
        setPage(nextPage);
        setHasMore(data.length === pageSize);
      })
      .finally(() => setLoading(false));
  };

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 md:py-16 lg:px-8">
      <header className="mb-10 max-w-2xl">
        <div className="mb-3 flex items-center gap-3 text-teal-700 dark:text-teal-300">
          <BookOpen aria-hidden="true" className="h-6 w-6" />
          <span className="text-sm font-semibold">公开笔记</span>
        </div>
        <h1 className="text-3xl font-bold text-slate-950 dark:text-white md:text-4xl">
          文章
        </h1>
        <p className="mt-4 leading-7 text-slate-600 dark:text-slate-300">
          记录工程实践、学习方法，以及值得反复回看的思考。
        </p>
      </header>

      {posts.length > 0 && categories.length > 0 && (
        <nav aria-label="文章分类" className="mb-8 flex flex-wrap gap-2">
          <FilterTab
            label="全部"
            active={activeCategory === null}
            onClick={() => selectCategory(null)}
          />
          {categories.map((category) => (
            <FilterTab
              key={category.id}
              label={category.name}
              active={activeCategory === category.slug}
              onClick={() => selectCategory(category.slug)}
            />
          ))}
        </nav>
      )}

      {loading && posts.length === 0 ? (
        <div className="flex min-h-72 items-center justify-center" role="status">
          <Loader2 aria-hidden="true" className="h-7 w-7 animate-spin text-teal-600" />
          <span className="sr-only">正在加载文章</span>
        </div>
      ) : posts.length === 0 ? (
        <section className="border-y border-slate-200 py-16 text-center dark:border-slate-700 md:py-24">
          <BookOpen aria-hidden="true" className="mx-auto h-10 w-10 text-violet-500" />
          <h2 className="mt-5 text-xl font-bold text-slate-950 dark:text-white">
            内容正在整理
          </h2>
          <p className="mx-auto mt-3 max-w-xl leading-7 text-slate-600 dark:text-slate-300">
            这里会记录代码、灵感与成长，内容正在慢慢整理。
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href="/projects"
              className="inline-flex min-h-11 items-center gap-2 rounded-md bg-teal-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-teal-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 dark:bg-teal-500 dark:text-slate-950"
            >
              查看项目
              <ArrowRight aria-hidden="true" className="h-4 w-4" />
            </Link>
            <Link
              href="/about"
              className="inline-flex min-h-11 items-center gap-2 rounded-md border border-slate-300 bg-white/70 px-5 py-2.5 text-sm font-semibold text-slate-800 hover:border-violet-500 hover:text-violet-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 dark:border-slate-600 dark:bg-slate-900/60 dark:text-slate-100"
            >
              <UserRound aria-hidden="true" className="h-4 w-4" />
              关于我
            </Link>
          </div>
        </section>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div
            key={activeCategory ?? "all"}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3"
          >
            {posts.map((post, index) => (
              <PostCard key={post.id} post={post} index={index} />
            ))}
          </motion.div>
        </AnimatePresence>
      )}

      {hasMore && posts.length > 0 && !loading && (
        <div className="mt-10 flex justify-center">
          <button
            type="button"
            onClick={handleLoadMore}
            className="min-h-11 rounded-md border border-slate-300 bg-white/70 px-6 py-2.5 text-sm font-semibold text-slate-800 hover:border-teal-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 dark:border-slate-600 dark:bg-slate-900/60 dark:text-slate-100"
          >
            加载更多
          </button>
        </div>
      )}

      {loading && posts.length > 0 && (
        <div className="mt-10 flex justify-center" role="status">
          <Loader2 aria-hidden="true" className="h-6 w-6 animate-spin text-teal-600" />
          <span className="sr-only">正在加载更多文章</span>
        </div>
      )}
    </main>
  );
}

function FilterTab({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`min-h-10 rounded-md border px-4 py-2 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 ${
        active
          ? "border-teal-700 bg-teal-700 text-white dark:border-teal-400 dark:bg-teal-400 dark:text-slate-950"
          : "border-slate-300 bg-white/70 text-slate-700 hover:border-teal-500 dark:border-slate-600 dark:bg-slate-900/60 dark:text-slate-200"
      }`}
    >
      {label}
    </button>
  );
}
