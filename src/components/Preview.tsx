"use client";

import "github-markdown-css/github-markdown-light.css";
import "highlight.js/styles/github.css";
import { useMemo } from "react";
import { renderMarkdown } from "@/lib/markdown";

export function Preview({ markdown }: { markdown: string }) {
  const html = useMemo(() => renderMarkdown(markdown), [markdown]);

  return (
    <div className="thin-scroll h-full overflow-auto bg-canvas">
      <div className="mx-auto max-w-3xl px-5 py-8 sm:px-8 sm:py-10">
        <div
          className="markdown-body rounded-lg border border-line bg-white p-6 shadow-sm sm:p-10"
          // Sanitized in renderMarkdown via rehype-sanitize.
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </div>
    </div>
  );
}
