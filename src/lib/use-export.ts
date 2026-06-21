"use client";

import { useCallback, useRef, useState } from "react";
import { useEditorStore } from "./store";
import { downloadPdf } from "./download";

export type ExportStatus = {
  type: "success" | "error";
  message: string;
} | null;

/**
 * Drives a PDF export: tracks busy state, flips the store's `pressing` flag so
 * the preview "sheet" can play its impression animation, and surfaces a
 * success/error message for a toast.
 */
export function useExport() {
  const markdown = useEditorStore((s) => s.markdown);
  const filename = useEditorStore((s) => s.filename);
  const options = useEditorStore((s) => s.options);
  const setPressing = useEditorStore((s) => s.setPressing);

  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<ExportStatus>(null);
  const pressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const exportPdf = useCallback(async () => {
    if (busy) return;
    setBusy(true);
    setStatus(null);
    const name = filename.toLowerCase().endsWith(".pdf")
      ? filename
      : `${filename || "document"}.pdf`;
    try {
      await downloadPdf({ markdown, filename, options });
      // Press the sheet as confirmation, then release.
      setPressing(true);
      if (pressTimer.current) clearTimeout(pressTimer.current);
      pressTimer.current = setTimeout(() => setPressing(false), 520);
      setStatus({ type: "success", message: `Exported ${name}` });
    } catch (e) {
      setStatus({
        type: "error",
        message: e instanceof Error ? e.message : "Export failed. Try again.",
      });
    } finally {
      setBusy(false);
    }
  }, [busy, markdown, filename, options, setPressing]);

  const dismiss = useCallback(() => setStatus(null), []);

  return { exportPdf, busy, status, dismiss };
}
