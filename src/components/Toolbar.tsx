"use client";

import { type RefObject } from "react";
import {
  Bold,
  Italic,
  Strikethrough,
  Heading,
  Link2,
  Image as ImageIcon,
  Code,
  Quote,
  List,
  ListOrdered,
  Table,
  Minus,
  Download,
} from "lucide-react";
import {
  wrap,
  prefixLines,
  insert,
  listLines,
  applyEdit,
  type Transform,
} from "@/lib/md-edit";
import { useEditorStore } from "@/lib/store";
import { downloadMarkdown } from "@/lib/download";

type ToolbarProps = {
  textareaRef: RefObject<HTMLTextAreaElement | null>;
  value: string;
  onChange: (next: string) => void;
};

type Button = { title: string; hint?: string; icon: React.ReactNode; transform: Transform };

const GROUPS: Button[][] = [
  [
    { title: "Bold", hint: "⌘B", icon: <Bold size={15} />, transform: wrap("**", "bold text") },
    { title: "Italic", hint: "⌘I", icon: <Italic size={15} />, transform: wrap("_", "italic text") },
    {
      title: "Strikethrough",
      icon: <Strikethrough size={15} />,
      transform: wrap("~~", "struck text"),
    },
    { title: "Code", hint: "⌘E", icon: <Code size={15} />, transform: wrap("`", "code") },
  ],
  [
    { title: "Heading", icon: <Heading size={15} />, transform: prefixLines("## ") },
    { title: "Quote", icon: <Quote size={15} />, transform: prefixLines("> ") },
    { title: "Bullet list", icon: <List size={15} />, transform: listLines(false) },
    {
      title: "Numbered list",
      icon: <ListOrdered size={15} />,
      transform: listLines(true),
    },
  ],
  [
    {
      title: "Link",
      hint: "⌘K",
      icon: <Link2 size={15} />,
      transform: insert("[link text](url)", 1, 10),
    },
    {
      title: "Image",
      icon: <ImageIcon size={15} />,
      // Select the "url" placeholder so the user types/pastes the address first.
      transform: insert("![alt text](url)", 12, 15),
    },
    {
      title: "Table",
      icon: <Table size={15} />,
      transform: insert(
        "\n| Column A | Column B |\n| -------- | -------- |\n| Cell 1   | Cell 2   |\n",
        0,
        0,
      ),
    },
    { title: "Divider", icon: <Minus size={15} />, transform: insert("\n---\n", 0, 0) },
  ],
];

export function Toolbar({ textareaRef, value, onChange }: ToolbarProps) {
  const filename = useEditorStore((s) => s.filename);

  function handleClick(transform: Transform) {
    const el = textareaRef.current;
    if (!el) return;
    applyEdit(el, value, onChange, transform);
  }

  return (
    <div
      role="toolbar"
      aria-label="Formatting"
      className="thin-scroll-dark flex shrink-0 items-center gap-0.5 overflow-x-auto border-b border-shell-line bg-shell px-2 py-1.5"
    >
      {GROUPS.map((group, i) => (
        <div key={i} className="flex items-center gap-0.5">
          {i > 0 && <span className="mx-1.5 h-4 w-px shrink-0 bg-shell-line" />}
          {group.map((b) => (
            <button
              key={b.title}
              type="button"
              title={b.hint ? `${b.title}  ${b.hint}` : b.title}
              aria-label={b.title}
              onClick={() => handleClick(b.transform)}
              className="focus-ring flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-chalk-dim transition-colors hover:bg-shell-raised hover:text-chalk"
            >
              {b.icon}
            </button>
          ))}
        </div>
      ))}

      {/* Take the source out. Sits opposite the format actions, mirroring
          "Export PDF" in the header - source leaves here, PDF leaves there. */}
      <div className="ml-auto flex items-center gap-0.5 pl-1">
        <span className="mx-1.5 h-4 w-px shrink-0 bg-shell-line" />
        <button
          type="button"
          onClick={() => downloadMarkdown(value, filename)}
          title="Download Markdown source (.md)"
          aria-label="Download Markdown source"
          className="focus-ring flex h-8 shrink-0 items-center gap-1.5 rounded-md px-2 text-xs font-medium text-chalk-dim transition-colors hover:bg-shell-raised hover:text-chalk"
        >
          <Download size={15} />
          <span className="hidden sm:inline">.md</span>
        </button>
      </div>
    </div>
  );
}
