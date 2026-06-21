import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { DEFAULT_DOC } from "./templates";
import { DEFAULT_PDF_OPTIONS, type PdfOptions } from "./pdf-options";

type EditorState = {
  markdown: string;
  filename: string;
  options: PdfOptions;
  setMarkdown: (markdown: string) => void;
  setFilename: (filename: string) => void;
  setOptions: (options: Partial<PdfOptions>) => void;
  reset: (markdown: string) => void;
};

export const useEditorStore = create<EditorState>()(
  persist(
    (set) => ({
      markdown: DEFAULT_DOC,
      filename: "document",
      options: DEFAULT_PDF_OPTIONS,
      setMarkdown: (markdown) => set({ markdown }),
      setFilename: (filename) => set({ filename }),
      setOptions: (options) =>
        set((state) => ({ options: { ...state.options, ...options } })),
      reset: (markdown) => set({ markdown }),
    }),
    {
      name: "mdtopdf-editor",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        markdown: state.markdown,
        filename: state.filename,
        options: state.options,
      }),
    },
  ),
);
