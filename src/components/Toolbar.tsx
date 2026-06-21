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
} from "lucide-react";

type Transform = (selected: string) => {
  text: string;
  selStart: number;
  selEnd: number;
};

type ToolbarProps = {
  textareaRef: RefObject<HTMLTextAreaElement | null>;
  value: string;
  onChange: (next: string) => void;
};

const wrap =
  (token: string, placeholder: string): Transform =>
  (selected) => {
    const inner = selected || placeholder;
    return {
      text: `${token}${inner}${token}`,
      selStart: token.length,
      selEnd: token.length + inner.length,
    };
  };

const prefixLines =
  (prefix: string): Transform =>
  (selected) => {
    const lines = (selected || "").split("\n");
    const text = lines
      .map((line, i) =>
        prefix === "1. " ? `${i + 1}. ${line}` : `${prefix}${line}`,
      )
      .join("\n");
    return { text, selStart: 0, selEnd: text.length };
  };

const insert =
  (snippet: string, selStart: number, selEnd: number): Transform =>
  () => ({ text: snippet, selStart, selEnd });

type Button = { title: string; icon: React.ReactNode; transform: Transform };

const GROUPS: Button[][] = [
  [
    { title: "Bold", icon: <Bold size={16} />, transform: wrap("**", "bold text") },
    { title: "Italic", icon: <Italic size={16} />, transform: wrap("_", "italic text") },
    {
      title: "Strikethrough",
      icon: <Strikethrough size={16} />,
      transform: wrap("~~", "struck text"),
    },
    { title: "Inline code", icon: <Code size={16} />, transform: wrap("`", "code") },
  ],
  [
    { title: "Heading", icon: <Heading size={16} />, transform: prefixLines("## ") },
    { title: "Quote", icon: <Quote size={16} />, transform: prefixLines("> ") },
    { title: "Bullet list", icon: <List size={16} />, transform: prefixLines("- ") },
    {
      title: "Numbered list",
      icon: <ListOrdered size={16} />,
      transform: prefixLines("1. "),
    },
  ],
  [
    {
      title: "Link",
      icon: <Link2 size={16} />,
      transform: insert("[link text](https://)", 1, 10),
    },
    {
      title: "Image",
      icon: <ImageIcon size={16} />,
      transform: insert("![alt text](https://)", 2, 10),
    },
    {
      title: "Table",
      icon: <Table size={16} />,
      transform: insert(
        "\n| Column A | Column B |\n| -------- | -------- |\n| Cell 1   | Cell 2   |\n",
        0,
        0,
      ),
    },
    { title: "Divider", icon: <Minus size={16} />, transform: insert("\n---\n", 0, 0) },
  ],
];

export function Toolbar({ textareaRef, value, onChange }: ToolbarProps) {
  // Ref access happens here, inside the click event handler — never during render.
  function handleClick(transform: Transform) {
    const el = textareaRef.current;
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const { text, selStart, selEnd } = transform(value.slice(start, end));
    onChange(value.slice(0, start) + text + value.slice(end));
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(start + selStart, start + selEnd);
    });
  }

  return (
    <div
      role="toolbar"
      aria-label="Formatting"
      className="thin-scroll flex shrink-0 items-center gap-0.5 overflow-x-auto border-b border-line bg-canvas px-2 py-1.5"
    >
      {GROUPS.map((group, i) => (
        <div key={i} className="flex items-center gap-0.5">
          {i > 0 && <span className="mx-1 h-5 w-px shrink-0 bg-line" />}
          {group.map((b) => (
            <button
              key={b.title}
              type="button"
              title={b.title}
              aria-label={b.title}
              onClick={() => handleClick(b.transform)}
              className="focus-ring flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-muted transition-colors hover:bg-zinc-100 hover:text-ink"
            >
              {b.icon}
            </button>
          ))}
        </div>
      ))}
    </div>
  );
}
