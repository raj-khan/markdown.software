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
 * Replace text in a textarea so the change stays on the browser's native
 * undo stack (Ctrl/Cmd+Z). We use `execCommand("insertText")` — the only
 * API that writes to the undo history and emits an `input` event, which keeps
 * React state in sync. Falls back to a direct value set if it isn't supported.
 */
function insertText(
  el: HTMLTextAreaElement,
  start: number,
  end: number,
  text: string,
  onChange: (next: string) => void,
) {
  el.focus();
  el.setSelectionRange(start, end);
  const ok = document.execCommand("insertText", false, text);
  if (!ok) {
    const value = el.value;
    onChange(value.slice(0, start) + text + value.slice(end));
  }
}

/**
 * Apply a transform to the current selection of a textarea (toolbar button or
 * keyboard shortcut), keeping the edit undoable, then select the placeholder
 * portion of whatever was inserted.
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
  insertText(el, start, end, text, onChange);
  requestAnimationFrame(() => {
    el.focus();
    el.setSelectionRange(start + selStart, start + selEnd);
  });
}

/** Insert plain text at the cursor (e.g. a Tab), keeping it undoable. */
export function insertAtCursor(
  el: HTMLTextAreaElement,
  text: string,
  onChange: (next: string) => void,
) {
  const start = el.selectionStart;
  const end = el.selectionEnd;
  insertText(el, start, end, text, onChange);
  requestAnimationFrame(() => {
    el.focus();
    el.setSelectionRange(start + text.length, start + text.length);
  });
}

// Keyboard shortcuts handled inside the editor textarea.
export const SHORTCUTS: Record<string, Transform> = {
  b: wrap("**", "bold text"),
  i: wrap("_", "italic text"),
  k: insert("[link text](https://)", 1, 10),
  e: wrap("`", "code"),
};
