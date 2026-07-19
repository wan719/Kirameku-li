import Image from "next/image";
import Link from "next/link";
import { Code2, Mail } from "lucide-react";

import { siteBrand } from "@/config/site";


const upstreamUrl = "https://github.com/Xinghongia/Kirameku";
const licenseUrl = "https://github.com/wan719/Kirameku-li/blob/main/LICENSE";

export default function Footer() {
  return (
    <footer className="site-footer mt-16 border-t">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-[minmax(0,1fr)_auto] md:items-end lg:px-8">
        <div className="min-w-0">
          <Link
            href="/"
            aria-label="Kirameku · 晚首页"
            className="inline-flex rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
          >
            <Image
              src="/brand/logo-wordmark.svg"
              alt="Kirameku · 晚"
              width={180}
              height={40}
              className="site-brand-image h-10 w-auto"
            />
          </Link>
          <p className="mt-3 max-w-xl text-sm leading-6 text-slate-600 dark:text-slate-300">
            {siteBrand.subtitle}
          </p>
          <div className="mt-4 flex flex-wrap gap-x-5 gap-y-3 text-sm font-medium">
            <a
              href={siteBrand.github}
              target="_blank"
              rel="noopener noreferrer"
              className="site-footer-link inline-flex items-center gap-2 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
            >
              <Code2 aria-hidden="true" className="h-4 w-4" />
              GitHub
            </a>
            <a
              href={`mailto:${siteBrand.email}`}
              className="site-footer-link inline-flex items-center gap-2 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
            >
              <Mail aria-hidden="true" className="h-4 w-4" />
              {siteBrand.email}
            </a>
          </div>
        </div>

        <div className="text-sm leading-6 text-slate-500 dark:text-slate-400 md:text-right">
          <p>
            基于{" "}
            <a
              href={upstreamUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="site-footer-link font-medium"
            >
              Kirameku
            </a>{" "}
            持续开发
          </p>
          <p className="mt-1">
            原许可证与上游署名保留 ·{" "}
            <a
              href={licenseUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="site-footer-link font-medium"
            >
              LICENSE
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
