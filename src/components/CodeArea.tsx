"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

type Props = {
  value: string;
  onChange: (value: string) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
};

/**
 * A line-numbered Markdown textarea.
 *
 * A plain <textarea> can't render a gutter, so we mirror its exact text
 * rendering in a hidden node to learn how many *visual* rows each logical line
 * wraps to. The gutter then reserves matching height per line number and is
 * translated in lock-step with the textarea's scroll, so numbers stay aligned
 * even when prose soft-wraps.
 */
export const CodeArea = forwardRef<HTMLTextAreaElement, Props>(
  function CodeArea({ value, onChange, onKeyDown }, ref) {
    const innerRef = useRef<HTMLTextAreaElement | null>(null);
    const gutterInnerRef = useRef<HTMLDivElement | null>(null);
    const mirrorRef = useRef<HTMLDivElement | null>(null);
    const rafRef = useRef<number | null>(null);

    // Visual-row count per logical line, plus measured metrics from the textarea.
    const [rows, setRows] = useState<number[]>([1]);
    const [metrics, setMetrics] = useState({ top: 16, line: 21 });

    const valueRef = useRef(value);
    valueRef.current = value;

    const setRefs = useCallback(
      (node: HTMLTextAreaElement | null) => {
        innerRef.current = node;
        if (typeof ref === "function") ref(node);
        else if (ref)
          (ref as React.MutableRefObject<HTMLTextAreaElement | null>).current =
            node;
      },
      [ref],
    );

    const syncScroll = useCallback(() => {
      const ta = innerRef.current;
      const gutter = gutterInnerRef.current;
      if (ta && gutter)
        gutter.style.transform = `translateY(${-ta.scrollTop}px)`;
    }, []);

    const measure = useCallback(() => {
      const ta = innerRef.current;
      const mirror = mirrorRef.current;
      if (!ta || !mirror) return;

      const cs = getComputedStyle(ta);
      const padLeft = parseFloat(cs.paddingLeft);
      const padRight = parseFloat(cs.paddingRight);
      const padTop = parseFloat(cs.paddingTop);
      const line = parseFloat(cs.lineHeight) || 21;

      // Match the textarea's text box so wrapping is identical.
      mirror.style.width = `${ta.clientWidth - padLeft - padRight}px`;
      mirror.style.fontFamily = cs.fontFamily;
      mirror.style.fontSize = cs.fontSize;
      mirror.style.fontWeight = cs.fontWeight;
      mirror.style.lineHeight = cs.lineHeight;
      mirror.style.letterSpacing = cs.letterSpacing;
      mirror.style.tabSize = cs.tabSize;

      const lines = valueRef.current.split("\n");
      mirror.replaceChildren(
        ...lines.map((text) => {
          const d = document.createElement("div");
          // Zero-width space keeps empty lines one row tall.
          d.textContent = text.length ? text : "​";
          return d;
        }),
      );

      const next = Array.from(mirror.children, (child) =>
        Math.max(1, Math.round((child as HTMLElement).offsetHeight / line)),
      );

      setRows(next);
      setMetrics({ top: padTop, line });
      syncScroll();
    }, [syncScroll]);

    // Remeasure on edit (coalesced into a frame to avoid thrash while typing).
    useLayoutEffect(() => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(measure);
      return () => {
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
      };
    }, [value, measure]);

    // Remeasure on resize (width changes wrapping) and once fonts load.
    useEffect(() => {
      measure();
      const ta = innerRef.current;
      const ro = new ResizeObserver(() => measure());
      if (ta) ro.observe(ta);

      let cancelled = false;
      document.fonts?.ready.then(() => {
        if (!cancelled) measure();
      });

      return () => {
        cancelled = true;
        ro.disconnect();
      };
    }, [measure]);

    const digits = String(rows.length).length;

    return (
      <div className="relative flex min-h-0 flex-1 overflow-hidden bg-shell">
        <div
          aria-hidden
          className="thin-scroll-dark relative shrink-0 select-none overflow-hidden border-r border-shell-line/70 bg-shell pl-3 pr-2 text-right font-mono text-[13px] text-chalk-dim/60 sm:text-sm"
          style={{ width: `calc(${digits}ch + 1.25rem)` }}
        >
          <div
            ref={gutterInnerRef}
            style={{ paddingTop: metrics.top, willChange: "transform" }}
          >
            {rows.map((rowCount, i) => (
              <div
                key={i}
                style={{ height: rowCount * metrics.line, lineHeight: `${metrics.line}px` }}
              >
                {i + 1}
              </div>
            ))}
          </div>
        </div>

        <textarea
          ref={setRefs}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={onKeyDown}
          onScroll={syncScroll}
          spellCheck={false}
          aria-label="Markdown source"
          placeholder="# Start typing…"
          className="thin-scroll-dark h-full min-h-0 flex-1 resize-none bg-shell py-4 pl-3 pr-4 font-mono text-[13px] leading-relaxed text-chalk caret-rust outline-none selection:bg-rust/30 sm:py-6 sm:pr-6 sm:text-sm"
        />

        {/* Hidden mirror used only to measure wrapped line heights. */}
        <div
          ref={mirrorRef}
          aria-hidden
          className="pointer-events-none absolute left-0 top-0 -z-10 m-0 h-0 overflow-hidden p-0 opacity-0"
          style={{
            whiteSpace: "pre-wrap",
            overflowWrap: "break-word",
            boxSizing: "content-box",
            visibility: "hidden",
          }}
        />
      </div>
    );
  },
);
