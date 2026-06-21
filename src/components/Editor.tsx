"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { Pencil, Eye } from "lucide-react";
import { useEditorStore } from "@/lib/store";
import { Toolbar } from "./Toolbar";
import { Preview } from "./Preview";

const noopSubscribe = () => () => {};
type View = "write" | "preview";

export function Editor() {
  const markdown = useEditorStore((s) => s.markdown);
  const setMarkdown = useEditorStore((s) => s.setMarkdown);
  const pageSize = useEditorStore((s) => s.options.pageSize);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Mobile-only pane switching; desktop always shows both panes.
  const [view, setView] = useState<View>("write");

  // Avoid SSR/localStorage hydration mismatches: render after hydration so
  // the persisted document is the single source of truth.
  const mounted = useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );

  // Debounce the preview so large documents stay responsive while typing.
  const [previewMarkdown, setPreviewMarkdown] = useState(markdown);
  useEffect(() => {
    const id = setTimeout(() => setPreviewMarkdown(markdown), 150);
    return () => clearTimeout(id);
  }, [markdown]);

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Tab") {
      e.preventDefault();
      const el = e.currentTarget;
      const start = el.selectionStart;
      const end = el.selectionEnd;
      setMarkdown(markdown.slice(0, start) + "  " + markdown.slice(end));
      requestAnimationFrame(() => {
        el.selectionStart = el.selectionEnd = start + 2;
      });
    }
  }

  if (!mounted) {
    return (
      <div className="flex flex-1 items-center justify-center text-sm text-muted">
        Loading editor…
      </div>
    );
  }

  const words = markdown.trim() ? markdown.trim().split(/\s+/).length : 0;

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {/* Mobile / tablet pane switcher */}
      <div className="flex shrink-0 border-b border-line bg-surface p-1.5 lg:hidden">
        <TabButton
          active={view === "write"}
          onClick={() => setView("write")}
          icon={<Pencil size={15} />}
          label="Write"
        />
        <TabButton
          active={view === "preview"}
          onClick={() => setView("preview")}
          icon={<Eye size={15} />}
          label="Preview"
        />
      </div>

      <div className="grid min-h-0 flex-1 lg:grid-cols-2">
        {/* Editor pane */}
        <section
          className={`min-h-0 flex-col border-line lg:flex lg:border-r ${
            view === "write" ? "flex" : "hidden"
          }`}
        >
          <Toolbar
            textareaRef={textareaRef}
            value={markdown}
            onChange={setMarkdown}
          />
          <textarea
            ref={textareaRef}
            value={markdown}
            onChange={(e) => setMarkdown(e.target.value)}
            onKeyDown={handleKeyDown}
            spellCheck={false}
            aria-label="Markdown source"
            placeholder="# Start writing Markdown…"
            className="thin-scroll min-h-0 flex-1 resize-none bg-surface p-4 font-mono text-[13px] leading-relaxed text-ink outline-none sm:text-sm"
          />
        </section>

        {/* Preview pane */}
        <section
          className={`min-h-0 bg-canvas lg:block ${
            view === "preview" ? "block" : "hidden"
          }`}
        >
          <Preview markdown={previewMarkdown} />
        </section>
      </div>

      {/* Status bar */}
      <footer className="flex shrink-0 items-center justify-between border-t border-line bg-surface px-3 py-1.5 text-xs text-muted sm:px-4">
        <span>
          {words.toLocaleString()} {words === 1 ? "word" : "words"} ·{" "}
          {markdown.length.toLocaleString()} chars
        </span>
        <span className="flex items-center gap-1.5">
          <span className="hidden sm:inline">Page</span>
          <span className="rounded bg-zinc-100 px-1.5 py-0.5 font-medium text-zinc-600">
            {pageSize}
          </span>
        </span>
      </footer>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`focus-ring flex flex-1 items-center justify-center gap-2 rounded-md py-1.5 text-sm font-medium transition-colors ${
        active
          ? "bg-accent-subtle text-accent-strong"
          : "text-muted hover:text-ink"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}
