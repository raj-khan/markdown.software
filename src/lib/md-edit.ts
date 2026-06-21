// Shared Markdown editing primitives, used by both the toolbar buttons and
// the editor's keyboard shortcuts so the two never drift.

export type Transform = (selected: string) => {
  text: string;
  selStart: number;
  selEnd: number;
};

export const wrap =
  (token: string, placeholder: string): Transform =>
  (selected) => {
    const inner = selected || placeholder;
    return {
      text: `${token}${inner}${token}`,
      selStart: token.length,
      selEnd: token.length + inner.length,
    };
  };

export const prefixLines =
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

export const insert =
  (snippet: string, selStart: number, selEnd: number): Transform =>
  () => ({ text: snippet, selStart, selEnd });

/**
 * Apply a transform to the current selection of a textarea, push the new
 * value through `onChange`, and restore a sensible selection afterward.
 */
export function applyEdit(
  el: HTMLTextAreaElement,
  value: string,
  onChange: (next: string) => void,
  transform: Transform,
) {
  const start = el.selectionStart;
  const end = el.selectionEnd;
  const { text, selStart, selEnd } = transform(value.slice(start, end));
  onChange(value.slice(0, start) + text + value.slice(end));
  requestAnimationFrame(() => {
    el.focus();
    el.setSelectionRange(start + selStart, start + selEnd);
  });
}

// Keyboard shortcuts handled inside the editor textarea.
export const SHORTCUTS: Record<string, Transform> = {
  b: wrap("**", "bold text"),
  i: wrap("_", "italic text"),
  k: insert("[link text](https://)", 1, 10),
  e: wrap("`", "code"),
};
