"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { Pencil, Eye, Maximize2, Columns2 } from "lucide-react";
import { useEditorStore } from "@/lib/store";
import { SHORTCUTS, applyEdit } from "@/lib/md-edit";
import { Toolbar } from "./Toolbar";
import { Preview } from "./Preview";

const noopSubscribe = () => () => {};
type View = "write" | "preview";

export function Editor() {
  const markdown = useEditorStore((s) => s.markdown);
  const setMarkdown = useEditorStore((s) => s.setMarkdown);
  const pageSize = useEditorStore((s) => s.options.pageSize);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [view, setView] = useState<View>("write"); // mobile/tablet only
  const [focus, setFocus] = useState(false); // desktop: hide preview

  const mounted = useSyncExternalStore(noopSubscribe, () => true, () => false);

  const [previewMarkdown, setPreviewMarkdown] = useState(markdown);
  useEffect(() => {
    const id = setTimeout(() => setPreviewMarkdown(markdown), 150);
    return () => clearTimeout(id);
  }, [markdown]);

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    const el = e.currentTarget;
    const mod = e.metaKey || e.ctrlKey;
    const transform = mod && !e.shiftKey ? SHORTCUTS[e.key.toLowerCase()] : undefined;
    if (transform) {
      e.preventDefault();
      applyEdit(el, markdown, setMarkdown, transform);
      return;
    }
    if (e.key === "Tab") {
      e.preventDefault();
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
      <div className="flex flex-1 items-center justify-center bg-shell text-sm text-chalk-dim">
        Setting type…
      </div>
    );
  }

  const words = markdown.trim() ? markdown.trim().split(/\s+/).length : 0;
  const minutes = Math.max(1, Math.round(words / 200));

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {/* Mobile / tablet pane switcher */}
      <div className="flex shrink-0 gap-1 border-b border-shell-line bg-shell px-1.5 py-1.5 lg:hidden">
        <TabButton active={view === "write"} onClick={() => setView("write")} icon={<Pencil size={15} />} label="Write" />
        <TabButton active={view === "preview"} onClick={() => setView("preview")} icon={<Eye size={15} />} label="Preview" />
      </div>

      <div className={`grid min-h-0 flex-1 ${focus ? "lg:grid-cols-1" : "lg:grid-cols-2"}`}>
        {/* Shell — where you type */}
        <section
          className={`min-h-0 flex-col border-shell-line lg:flex ${
            focus ? "" : "lg:border-r"
          } ${view === "write" ? "flex" : "hidden"}`}
        >
          <Toolbar textareaRef={textareaRef} value={markdown} onChange={setMarkdown} />
          <textarea
            ref={textareaRef}
            value={markdown}
            onChange={(e) => setMarkdown(e.target.value)}
            onKeyDown={handleKeyDown}
            spellCheck={false}
            aria-label="Markdown source"
            placeholder="# Start typing…"
            className="thin-scroll-dark min-h-0 flex-1 resize-none bg-shell p-4 font-mono text-[13px] leading-relaxed text-chalk caret-rust outline-none selection:bg-rust/30 sm:p-6 sm:text-sm"
          />
        </section>

        {/* Paper — what you make */}
        <section className={`min-h-0 bg-canvas lg:block ${focus ? "lg:hidden" : ""} ${view === "preview" ? "block" : "hidden"}`}>
          <Preview markdown={previewMarkdown} />
        </section>
      </div>

      {/* Status rail */}
      <footer className="flex shrink-0 items-center justify-between gap-3 border-t border-shell-line bg-shell px-3 py-1.5 text-xs text-chalk-dim sm:px-4">
        <span className="font-mono">
          {words.toLocaleString()} {words === 1 ? "word" : "words"}
          <span className="mx-1.5 text-shell-line">·</span>~{minutes} min read
        </span>
        <span className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setFocus((v) => !v)}
            aria-pressed={focus}
            className="focus-ring hidden items-center gap-1.5 rounded px-1.5 py-0.5 transition-colors hover:text-chalk lg:flex"
          >
            {focus ? <Columns2 size={13} /> : <Maximize2 size={13} />}
            {focus ? "Show preview" : "Focus"}
          </button>
          <span className="flex items-center gap-1.5">
            <span className="hidden sm:inline">Page</span>
            <span className="rounded bg-shell-raised px-1.5 py-0.5 font-mono font-medium text-chalk">
              {pageSize}
            </span>
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
        active ? "bg-shell-raised text-chalk" : "text-chalk-dim hover:text-chalk"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}
