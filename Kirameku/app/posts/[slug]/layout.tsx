import type { ReactNode } from "react";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

type PostDetailLayoutProps = {
  children: ReactNode;
  params: Promise<{ slug: string }>;
};

const apiBase = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
).replace(/\/$/, "");

export default async function PostDetailLayout({
  children,
  params,
}: PostDetailLayoutProps) {
  const { slug } = await params;

  try {
    const response = await fetch(
      `${apiBase}/api/posts/${encodeURIComponent(slug)}`,
      { cache: "no-store" },
    );
    if (!response.ok) notFound();
  } catch {
    notFound();
  }

  return children;
}
