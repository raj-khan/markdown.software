"use client";

import { useState } from "react";
import Link from "next/link";
import { FileDown, Loader2, AlertCircle, X } from "lucide-react";
import { useEditorStore } from "@/lib/store";
import { downloadPdf } from "@/lib/download";
import { DocControls } from "./DocControls";
import { SettingsMenu } from "./SettingsMenu";

const GITHUB_URL = "https://github.com/markdowntopdf/markdowntopdf.sh";

function GithubIcon({ size = 18 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M12 .5C5.73.5.5 5.73.5 12a11.5 11.5 0 0 0 7.86 10.92c.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.37-3.88-1.37-.53-1.34-1.3-1.7-1.3-1.7-1.06-.72.08-.71.08-.71 1.17.08 1.79 1.2 1.79 1.2 1.04 1.79 2.73 1.27 3.4.97.1-.76.41-1.27.74-1.56-2.55-.29-5.23-1.28-5.23-5.7 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.46.11-3.05 0 0 .98-.31 3.2 1.18a11.1 11.1 0 0 1 5.83 0c2.22-1.49 3.2-1.18 3.2-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.84 1.19 3.1 0 4.43-2.69 5.41-5.25 5.69.42.36.79 1.07.79 2.16v3.2c0 .31.21.67.8.56A11.5 11.5 0 0 0 23.5 12C23.5 5.73 18.27.5 12 .5Z" />
    </svg>
  );
}

function BrandMark() {
  return (
    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-ink font-mono text-sm font-bold text-white">
      md
    </span>
  );
}

export function Header() {
  const { markdown, filename, options } = useEditorStore();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDownload() {
    setBusy(true);
    setError(null);
    try {
      await downloadPdf({ markdown, filename, options });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <header className="flex items-center justify-between gap-3 border-b border-line bg-surface px-3 py-2.5 sm:px-4">
      <Link href="/" className="focus-ring flex items-center gap-2.5 rounded-md">
        <BrandMark />
        <span className="leading-tight">
          <span className="block text-[15px] font-semibold text-ink">
            markdowntopdf<span className="text-accent">.sh</span>
          </span>
          <span className="hidden whitespace-nowrap text-xs text-muted lg:block">
            Free &amp; open-source Markdown to PDF
          </span>
        </span>
      </Link>

      <div className="flex items-center gap-2">
        {/* Desktop: controls inline. Smaller: tucked into the settings menu. */}
        <div className="hidden lg:flex">
          <DocControls variant="inline" />
        </div>
        <div className="lg:hidden">
          <SettingsMenu />
        </div>

        <a
          href={GITHUB_URL}
          target="_blank"
          rel="noreferrer"
          title="View source on GitHub"
          aria-label="View source on GitHub"
          className="focus-ring hidden h-9 w-9 items-center justify-center rounded-md border border-line text-muted transition-colors hover:border-zinc-300 hover:text-ink sm:flex"
        >
          <GithubIcon size={18} />
        </a>

        <button
          type="button"
          onClick={handleDownload}
          disabled={busy}
          className="focus-ring flex h-9 items-center gap-2 rounded-md bg-accent px-3.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-accent-strong disabled:cursor-not-allowed disabled:opacity-60"
        >
          {busy ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <FileDown size={16} />
          )}
          <span className="hidden sm:inline">
            {busy ? "Generating…" : "Download PDF"}
          </span>
          <span className="sm:hidden">{busy ? "…" : "PDF"}</span>
        </button>
      </div>

      {error && (
        <div
          role="alert"
          className="fixed inset-x-0 bottom-4 z-30 mx-auto flex w-[min(92%,28rem)] items-start gap-2.5 rounded-lg border border-red-200 bg-red-50 px-3.5 py-3 text-sm text-red-800 shadow-lg"
        >
          <AlertCircle size={18} className="mt-px shrink-0 text-red-500" />
          <p className="flex-1">{error}</p>
          <button
            type="button"
            aria-label="Dismiss error"
            onClick={() => setError(null)}
            className="focus-ring shrink-0 rounded text-red-400 hover:text-red-700"
          >
            <X size={16} />
          </button>
        </div>
      )}
    </header>
  );
}
