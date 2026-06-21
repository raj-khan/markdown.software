import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { DEFAULT_DOC } from "./templates";
import { DEFAULT_PDF_OPTIONS, type PdfOptions } from "./pdf-options";

type EditorState = {
  markdown: string;
  filename: string;
  options: PdfOptions;
  /** Transient: true while a PDF export is in flight (drives the press animation). */
  pressing: boolean;
  /** Desktop split: fraction of width given to the editor (0 = preview only, 1 = editor only). */
  splitRatio: number;
  setMarkdown: (markdown: string) => void;
  setFilename: (filename: string) => void;
  setOptions: (options: Partial<PdfOptions>) => void;
  setPressing: (pressing: boolean) => void;
  setSplitRatio: (ratio: number) => void;
  reset: (markdown: string) => void;
};

export const useEditorStore = create<EditorState>()(
  persist(
    (set) => ({
      markdown: DEFAULT_DOC,
      filename: "document",
      options: DEFAULT_PDF_OPTIONS,
      pressing: false,
      splitRatio: 0.5,
      setMarkdown: (markdown) => set({ markdown }),
      setFilename: (filename) => set({ filename }),
      setOptions: (options) =>
        set((state) => ({ options: { ...state.options, ...options } })),
      setPressing: (pressing) => set({ pressing }),
      setSplitRatio: (ratio) =>
        set({ splitRatio: Math.min(1, Math.max(0, ratio)) }),
      reset: (markdown) => set({ markdown }),
    }),
    {
      name: "mdtopdf-editor",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        markdown: state.markdown,
        filename: state.filename,
        options: state.options,
        splitRatio: state.splitRatio,
      }),
    },
  ),
);
