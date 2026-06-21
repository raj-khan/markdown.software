# markdowntopdf.sh - Architecture &amp; Rollout Plan

This document is the north star for building and shipping **markdowntopdf.sh**:
an open-source, free Markdown→PDF tool inspired by
[markdowntopdf.com](https://www.markdowntopdf.com), with a
[readme.so](https://readme.so/editor)-style live editor.

---

## 1. Goals &amp; non-goals

**Goals**

1. A delightful, no-login Markdown→PDF tool that "just works."
2. PDF output quality on par with markdowntopdf.com (vector text, code
   highlighting, GitHub-style typography).
3. Fully open source (MIT), trivially self-hostable, deployable to Vercel
   with zero config.
4. A clean, small codebase that contributors can understand in an afternoon.

**Non-goals (for now)**

- Becoming a full SaaS with billing/teams/seats.
- Locking core functionality behind accounts. The tool must be 100% usable
  without signing in - accounts are strictly additive.

---

## 2. Recommendation on the starting point

The brief asked whether to roll out using the
[`nextjs-supabase-saas-boilerplate`](https://github.com/raj-khan/nextjs-supabase-saas-boilerplate)
style, "or suggest otherwise." **Recommendation: do not start from the full
SaaS boilerplate.**

| Concern        | Full SaaS boilerplate                         | This project's approach                          |
| -------------- | --------------------------------------------- | ------------------------------------------------ |
| Core value     | Gated behind auth/billing                     | Free, instant, no login - the whole point        |
| Surface area   | Auth, billing, dashboards, RBAC, emails…      | One editor + one API route                       |
| Contributor on-ramp | Steep                                    | Shallow - read it in an afternoon                |
| PDF engine     | Not included anyway                           | First-class                                      |
| Time to launch | Weeks of trimming                             | Hours                                            |

Instead we use a **lean Next.js App Router app** and borrow the *good ideas*
from the SaaS boilerplate **as optional layers**:

- **Supabase** for (optional) auth + saved documents - wired but inert until
  you add keys. See `src/lib/supabase/*` and `supabase/schema.sql`.
- **Vercel-first** deployment, env conventions, and project structure.
- Room to grow into a "Pro" tier later *without* compromising the free tool.

If/when monetization becomes a goal (Pro export options, API plans), the
Supabase layer is already the seam to build billing onto - at that point the
SaaS boilerplate's billing patterns can be lifted in deliberately.

---

## 3. Architecture

```
Browser (React 19, client)                    Server (Next.js route handler)
┌───────────────────────────────┐             ┌──────────────────────────────┐
│ Header  (templates, options,   │             │ POST /api/pdf                │
│          filename, download)   │  fetch ───▶ │  1. validate + sanitize      │
│ Toolbar (formatting buttons)   │             │  2. renderMarkdown()         │
│ Editor  (textarea + state)     │             │  3. buildPdfHtml() + CSS     │
│ Preview (live HTML)            │             │  4. Puppeteer → PDF bytes    │
└──────────────┬────────────────┘             └──────────────┬───────────────┘
               │ zustand store (localStorage persisted)      │
               ▼                                              ▼
        src/lib/markdown.ts  ◀──── single shared pipeline ───┘
        (remark + rehype + sanitize + highlight → HTML)
```

**Key design decision - one pipeline, two outputs.** The on-screen preview and
the server PDF both render through `src/lib/markdown.ts` and the same
stylesheet (`src/lib/pdf-styles.ts`). This guarantees the PDF matches the
preview and eliminates a whole class of "looks different when exported" bugs.

**PDF engine.** `puppeteer-core` drives a headless Chrome. Locally it
auto-detects a system browser; on Vercel/Lambda it uses
`@sparticuz/chromium`. Chosen over rasterizing libraries (jsPDF/html2canvas)
because only a real browser gives crisp vector text, proper pagination, and
faithful CSS.

**Why vendor the CSS** (`scripts/gen-css.mjs` → `src/lib/pdf-styles.ts`):
reading stylesheets from `node_modules` at runtime is fragile under bundlers
and serverless file tracing. Vendoring guarantees the styles ship with the
function.

---

## 4. Current status - Phase 0 (MVP) ✅ DONE

Everything below is implemented and verified (`npm run build`, `lint`, and a
real PDF round-trip all pass):

- [x] Next.js 16 + React 19 + Tailwind v4 scaffold
- [x] readme.so-style split editor with formatting toolbar
- [x] Live preview (debounced) using the shared pipeline
- [x] GFM, tables, task lists, syntax highlighting
- [x] Server-side PDF export with page-size + margin options
- [x] Templates (welcome, README, resume, blank)
- [x] `localStorage` autosave
- [x] Optional Supabase scaffold (client/server/schema) - inert without keys
- [x] Docs: README, CONTRIBUTING, LICENSE (MIT), this plan

---

## 5. Roadmap

### Phase 1 - Polish &amp; launch-readiness
- [ ] Mobile/responsive pass (tabbed editor⇄preview on small screens)
- [ ] Dark mode for the editor chrome (preview/PDF stay print-light)
- [ ] Drag-to-resize split panes; synced scroll
- [ ] Import a `.md` file; copy-rendered-HTML button
- [ ] Empty/error states and a friendly "PDF failed" retry
- [ ] `/api/pdf` rate limiting (Vercel BotID / WAF) + payload caps (caps done)
- [ ] OG image, favicon, `sitemap.ts`, `robots.ts`
- [ ] Basic analytics (privacy-friendly, e.g. Vercel Analytics)

### Phase 2 - Power features
- [ ] PDF theming: font family, font size, line height, page numbers, header/footer
- [ ] Cover page + table-of-contents generation
- [ ] Custom CSS injection for advanced users
- [ ] Mermaid / math (KaTeX) rendering
- [ ] Shareable links (server-rendered preview of a doc)

### Phase 3 - Accounts (optional tier, additive)
- [ ] Supabase auth (magic link / OAuth)
- [ ] Save / list / rename / delete documents (schema already in repo)
- [ ] Sync local doc → cloud on first sign-in
- [ ] Per-user export history

### Phase 4 - Platform
- [ ] Public REST API: `POST /api/pdf` documented + API keys
- [ ] CLI (`npx markdowntopdf file.md`) hitting the same engine
- [ ] Embeddable editor widget

> Free tool stays free forever. Any future "Pro" only adds *optional* power
> features; it never gates Markdown→PDF.

---

## 6. Rollout / launch plan

**Repository**
- [ ] Create GitHub org/repo `markdowntopdf/markdowntopdf.sh` (public)
- [ ] Add issue/PR templates, `CODE_OF_CONDUCT.md`, topics, description
- [ ] GitHub Actions CI: `lint` + `build` on PRs (see `.github/` - Phase 1)
- [ ] Enable Dependabot

**Hosting &amp; domain**
- [ ] Import repo into Vercel; production branch = `main`
- [ ] Point `markdowntopdf.sh` (and `www`) at Vercel
- [ ] Confirm `/api/pdf` runs as a Node function (300s default timeout is ample)
- [ ] Verify `@sparticuz/chromium` cold-start works in production

**SEO &amp; growth**
- [ ] Strong `<title>`/meta + structured data (done: metadata in `layout.tsx`)
- [ ] Landing content targeting "markdown to pdf", "md to pdf", "readme to pdf"
- [ ] Submit to Google Search Console; add `sitemap.ts`
- [ ] Open-source launch: Product Hunt, Hacker News "Show HN", r/webdev
- [ ] README badges, demo GIF, and a hosted demo link

**Trust &amp; ops**
- [ ] Privacy note: documents are processed in-memory and not stored
- [ ] Status/error monitoring (Vercel Agent / logs)
- [ ] Abuse protection on the public PDF endpoint

---

## 7. Risks &amp; mitigations

| Risk                                   | Mitigation                                               |
| -------------------------------------- | -------------------------------------------------------- |
| Chromium cold starts / size on Vercel  | `serverExternalPackages`, vendored CSS, `@sparticuz/chromium` |
| Abuse of the open PDF endpoint         | Payload caps (done) + rate limiting / WAF (Phase 1)      |
| XSS via raw HTML in Markdown           | `rehype-sanitize` with a constrained schema              |
| Preview/PDF drift                      | Single shared pipeline + shared CSS                      |
| Scope creep into a heavy SaaS          | Accounts kept strictly optional and additive             |

---

## 8. Definition of done for v1.0 (public launch)

- Phase 1 complete; mobile-usable; no console errors.
- p95 PDF generation < 5s for typical documents in production.
- CI green; README demo + screenshot; live at `https://www.markdowntopdf.sh`.
- "Show HN" / Product Hunt post drafted.
