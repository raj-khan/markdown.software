# Contributing to markdowntopdf.sh

Thanks for your interest in improving the project! This is a small, friendly
codebase and contributions of all sizes are welcome.

## Development setup

```bash
npm install
npm run dev
```

You'll need a system Chrome/Chromium for local PDF rendering (the app
auto-detects common locations; otherwise set `CHROME_PATH` in `.env.local`).

## Before you open a PR

```bash
npm run lint     # must pass
npm run build    # must pass
```

Please keep changes focused - one logical change per pull request.

## Project layout

```
src/
  app/
    page.tsx            # assembles the editor
    layout.tsx          # metadata, fonts
    api/pdf/route.ts    # Markdown → PDF endpoint
  components/
    Header.tsx          # top bar: templates, options, download
    Editor.tsx          # split-pane editor shell
    Toolbar.tsx         # formatting buttons
    Preview.tsx         # live HTML preview
  lib/
    markdown.ts         # shared Markdown → HTML pipeline
    pdf-document.ts     # HTML document wrapper for printing
    pdf-styles.ts       # vendored CSS (generated - see below)
    browser.ts          # headless browser launcher
    store.ts            # zustand editor state
    templates.ts        # starter documents
    download.ts         # client-side download helper
    supabase/           # optional auth + persistence
supabase/schema.sql     # optional documents table + RLS
scripts/gen-css.mjs     # regenerates src/lib/pdf-styles.ts
```

## Notes

- **Preview and PDF must stay in sync.** Both render through
  `src/lib/markdown.ts` and the same CSS, on purpose. If you change one,
  change the other.
- **`src/lib/pdf-styles.ts` is generated.** Don't edit it by hand; run
  `npm run gen:css` after bumping `github-markdown-css` or `highlight.js`.
- **Security.** Rendered Markdown is sanitized via `rehype-sanitize`. Be
  careful loosening the schema in `src/lib/markdown.ts`.

## Commit messages

Use short, imperative subjects: `Add table button to toolbar`,
`Fix PDF margins on Letter size`, etc.
