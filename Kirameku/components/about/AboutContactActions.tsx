"use client";

import { useState } from "react";
import { Check, Clipboard, ExternalLink, GitBranch, Mail, TriangleAlert } from "lucide-react";

type CopyState = "idle" | "success" | "error";

export default function AboutContactActions({
  github,
  email,
}: {
  github: string;
  email: string;
}) {
  const [copyState, setCopyState] = useState<CopyState>("idle");

  const copyEmail = async () => {
    try {
      await Promise.race([
        navigator.clipboard.writeText(email),
        new Promise<never>((_, reject) => {
          window.setTimeout(() => reject(new Error("clipboard timeout")), 1000);
        }),
      ]);
      setCopyState("success");
    } catch {
      setCopyState("error");
    }
  };

  return (
    <div className="mt-7">
      <div className="flex flex-wrap gap-3">
        <a
          href={github}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-11 items-center gap-2 rounded-md bg-slate-950 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 dark:bg-white dark:text-slate-950"
        >
          <GitBranch aria-hidden="true" className="h-4 w-4" />
          GitHub
          <ExternalLink aria-hidden="true" className="h-3.5 w-3.5" />
        </a>
        <a
          href={`mailto:${email}`}
          className="inline-flex min-h-11 items-center gap-2 rounded-md bg-teal-700 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 dark:bg-teal-500 dark:text-slate-950"
        >
          <Mail aria-hidden="true" className="h-4 w-4" />
          发送邮件
        </a>
        <button
          type="button"
          onClick={copyEmail}
          className="inline-flex min-h-11 items-center gap-2 rounded-md border border-slate-300 bg-white/70 px-4 py-2 text-sm font-semibold text-slate-800 hover:border-violet-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 dark:border-slate-600 dark:bg-slate-900/60 dark:text-slate-100"
        >
          <Clipboard aria-hidden="true" className="h-4 w-4" />
          复制邮箱
        </button>
      </div>
      <p className="mt-3 min-h-6 text-sm text-slate-600 dark:text-slate-300" role="status" aria-live="polite">
        {copyState === "success" && (
          <span className="inline-flex items-center gap-2 text-teal-700 dark:text-teal-300">
            <Check aria-hidden="true" className="h-4 w-4" />
            复制成功
          </span>
        )}
        {copyState === "error" && (
          <span className="inline-flex items-center gap-2 text-rose-700 dark:text-rose-300">
            <TriangleAlert aria-hidden="true" className="h-4 w-4" />
            复制失败，请使用邮件按钮
          </span>
        )}
      </p>
    </div>
  );
}
