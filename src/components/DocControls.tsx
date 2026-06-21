"use client";

import { useEditorStore } from "@/lib/store";
import { TEMPLATES } from "@/lib/templates";
import { PAGE_SIZES } from "@/lib/pdf-options";

type Variant = "inline" | "stacked";

const fieldBase =
  "h-9 rounded-md border border-line bg-surface text-sm text-ink focus-ring hover:border-zinc-300 transition-colors";

export function DocControls({ variant }: { variant: Variant }) {
  const { filename, options, setFilename, setOptions, reset } = useEditorStore();

  function handleTemplate(id: string) {
    const template = TEMPLATES.find((t) => t.id === id);
    if (template) reset(template.content);
  }

  const stacked = variant === "stacked";
  const group = stacked ? "flex flex-col gap-1.5" : "contents";
  const label = stacked
    ? "text-xs font-medium text-muted"
    : "sr-only";

  return (
    <div
      className={
        stacked ? "flex flex-col gap-4" : "flex items-center gap-2"
      }
    >
      <div className={group}>
        <label htmlFor="template" className={label}>
          Template
        </label>
        <select
          id="template"
          defaultValue=""
          onChange={(e) => {
            handleTemplate(e.target.value);
            e.target.value = "";
          }}
          className={`${fieldBase} px-2 ${stacked ? "w-full" : ""}`}
        >
          <option value="" disabled>
            Templates
          </option>
          {TEMPLATES.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>
      </div>

      <div className={group}>
        <label htmlFor="page-size" className={label}>
          Page size
        </label>
        <select
          id="page-size"
          value={options.pageSize}
          onChange={(e) =>
            setOptions({
              pageSize: e.target.value as (typeof PAGE_SIZES)[number],
            })
          }
          className={`${fieldBase} px-2 ${stacked ? "w-full" : ""}`}
        >
          {PAGE_SIZES.map((size) => (
            <option key={size} value={size}>
              {size}
            </option>
          ))}
        </select>
      </div>

      <div className={group}>
        <label htmlFor="filename" className={label}>
          File name
        </label>
        <div
          className={`flex h-9 items-center rounded-md border border-line bg-surface pr-2 focus-within:border-accent ${
            stacked ? "w-full" : ""
          }`}
        >
          <input
            id="filename"
            value={filename}
            onChange={(e) => setFilename(e.target.value)}
            placeholder="document"
            className={`h-full rounded-l-md bg-transparent px-2.5 text-sm text-ink outline-none ${
              stacked ? "flex-1" : "w-28"
            }`}
          />
          <span className="text-xs text-muted">.pdf</span>
        </div>
      </div>
    </div>
  );
}
