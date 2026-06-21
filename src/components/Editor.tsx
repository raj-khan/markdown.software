"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { Pencil, Eye, PanelLeft, Columns2, PanelRight } from "lucide-react";
import { useEditorStore } from "@/lib/store";
import { SHORTCUTS, applyEdit, insertAtCursor } from "@/lib/md-edit";
import { Toolbar } from "./Toolbar";
import { Preview } from "./Preview";

const noopSubscribe = () => () => {};
type View = "write" | "preview";
const MIN = 0.15;
const MAX = 0.85;

export function Editor() {
  const markdown = useEditorStore((s) => s.markdown);
  const setMarkdown = useEditorStore((s) => s.setMarkdown);
  const pageSize = useEditorStore((s) => s.options.pageSize);
  const ratio = useEditorStore((s) => s.splitRatio);
  const setSplitRatio = useEditorStore((s) => s.setSplitRatio);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [view, setView] = useState<View>("write"); // mobile/tablet only
  const containerRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);
  const rectRef = useRef<{ left: number; width: number } | null>(null);
  const rafRef = useRef<number | null>(null);

  const mounted = useSyncExternalStore(noopSubscribe, () => true, () => false);

  const [previewMarkdown, setPreviewMarkdown] = useState(markdown);
  useEffect(() => {
    const id = setTimeout(() => setPreviewMarkdown(markdown), 150);
    return () => clearTimeout(id);
  }, [markdown]);

  // Divider drag (desktop). Width is cached at drag start; updates are
  // rAF-throttled. The preview only reflows — it never re-parses on resize.
  useEffect(() => {
    if (!dragging) return;
    function onMove(e: MouseEvent) {
      const rect = rectRef.current;
      if (!rect || rafRef.current) return;
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = null;
        const x = (e.clientX - rect.left) / rect.width;
        setSplitRatio(Math.min(MAX, Math.max(MIN, x)));
      });
    }
    function onUp() {
      setDragging(false);
    }
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    const prevSelect = document.body.style.userSelect;
    const prevCursor = document.body.style.cursor;
    document.body.style.userSelect = "none";
    document.body.style.cursor = "col-resize";
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      document.body.style.userSelect = prevSelect;
      document.body.style.cursor = prevCursor;
    };
  }, [dragging, setSplitRatio]);

  function startDrag(e: React.MouseEvent) {
    const el = containerRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    rectRef.current = { left: r.left, width: r.width };
    setDragging(true);
    e.preventDefault();
  }

  function onDividerKey(e: React.KeyboardEvent) {
    if (e.key === "ArrowLeft") setSplitRatio(Math.max(MIN, ratio - 0.02));
    else if (e.key === "ArrowRight") setSplitRatio(Math.min(MAX, ratio + 0.02));
    else if (e.key === "Home") setSplitRatio(MIN);
    else if (e.key === "End") setSplitRatio(MAX);
    else return;
    e.preventDefault();
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    const el = e.currentTarget;
    const mod = e.metaKey || e.ctrlKey;
    const transform = mod && !e.shiftKey ? SHORTCUTS[e.key.toLowerCase()] : undefined;
    if (transform) {
      e.preventDefault();
      applyEdit(el, markdown, setMarkdown, transform);
    } else if (e.key === "Tab") {
      e.preventDefault();
      insertAtCursor(el, "  ", setMarkdown);
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
  const editorOnly = ratio >= 0.98;
  const previewOnly = ratio <= 0.02;
  const isSplit = !editorOnly && !previewOnly;
  const gridTemplate = `minmax(0, ${ratio}fr) ${isSplit ? 7 : 0}px minmax(0, ${1 - ratio}fr)`;

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {/* Mobile / tablet pane switcher */}
      <div className="flex shrink-0 gap-1 border-b border-shell-line bg-shell px-1.5 py-1.5 lg:hidden">
        <TabButton active={view === "write"} onClick={() => setView("write")} icon={<Pencil size={15} />} label="Write" />
        <TabButton active={view === "preview"} onClick={() => setView("preview")} icon={<Eye size={15} />} label="Preview" />
      </div>

      <div
        ref={containerRef}
        className="block min-h-0 flex-1 lg:grid"
        style={{ gridTemplateColumns: gridTemplate }}
      >
        {/* Shell — where you type */}
        <section
          className={`min-h-0 flex-col lg:col-start-1 lg:flex ${
            view === "write" ? "flex" : "hidden"
          } ${previewOnly ? "lg:hidden" : ""}`}
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

        {/* Draggable divider (desktop only) */}
        <div
          role="separator"
          aria-orientation="vertical"
          aria-label="Resize editor and preview"
          aria-valuenow={Math.round(ratio * 100)}
          aria-valuemin={Math.round(MIN * 100)}
          aria-valuemax={Math.round(MAX * 100)}
          tabIndex={isSplit ? 0 : -1}
          onMouseDown={startDrag}
          onDoubleClick={() => setSplitRatio(0.5)}
          onKeyDown={onDividerKey}
          title="Drag to resize · double-click to reset"
          className={`group relative hidden cursor-col-resize items-center justify-center bg-shell-line focus-ring lg:col-start-2 lg:flex ${
            isSplit ? "" : "pointer-events-none invisible"
          } ${dragging ? "bg-rust" : "hover:bg-rust/60"}`}
        >
          <span className="h-8 w-1 rounded-full bg-chalk-dim/50 transition-colors group-hover:bg-white/80" />
        </div>

        {/* Paper — what you make */}
        <section
          className={`min-h-0 bg-canvas lg:col-start-3 lg:block ${
            view === "preview" ? "block" : "hidden"
          } ${editorOnly ? "lg:hidden" : ""}`}
        >
          <Preview markdown={previewMarkdown} />
        </section>
      </div>

      {/* Status rail */}
      <footer className="grid shrink-0 grid-cols-[1fr_auto_1fr] items-center gap-3 border-t border-shell-line bg-shell px-3 py-1.5 text-xs text-chalk-dim sm:px-4">
        <span className="justify-self-start font-mono">
          {words.toLocaleString()} {words === 1 ? "word" : "words"}
          <span className="mx-1.5 text-shell-line">·</span>~{minutes} min read
        </span>

        <ViewControl ratio={ratio} setSplitRatio={setSplitRatio} />

        <span className="flex items-center gap-1.5 justify-self-end">
          <span className="hidden sm:inline">Page</span>
          <span className="rounded bg-shell-raised px-1.5 py-0.5 font-mono font-medium text-chalk">
            {pageSize}
          </span>
        </span>
      </footer>
    </div>
  );
}

function ViewControl({
  ratio,
  setSplitRatio,
}: {
  ratio: number;
  setSplitRatio: (r: number) => void;
}) {
  const mode = ratio >= 0.98 ? "editor" : ratio <= 0.02 ? "preview" : "split";
  const items: { id: string; label: string; icon: React.ReactNode; value: number }[] = [
    { id: "editor", label: "Editor only", icon: <PanelLeft size={14} />, value: 1 },
    { id: "split", label: "Split view", icon: <Columns2 size={14} />, value: 0.5 },
    { id: "preview", label: "Preview only", icon: <PanelRight size={14} />, value: 0 },
  ];
  return (
    <div className="hidden items-center gap-0.5 justify-self-center rounded-md bg-shell-raised p-0.5 lg:flex">
      {items.map((it) => (
        <button
          key={it.id}
          type="button"
          aria-label={it.label}
          aria-pressed={mode === it.id}
          title={it.label}
          onClick={() => setSplitRatio(it.value)}
          className={`focus-ring flex h-6 w-7 items-center justify-center rounded transition-colors ${
            mode === it.id ? "bg-rust text-white" : "text-chalk-dim hover:text-chalk"
          }`}
        >
          {it.icon}
        </button>
      ))}
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
