# Security

This document is the threat model and hardening plan for markdowntopdf.sh.
It covers the full attack surface, what is implemented, and what is planned.

## Reporting a vulnerability

Please do not open a public issue for security reports. Email
meherullah97@gmail.com with details and steps to reproduce.

## Threat model

markdowntopdf.sh is a public, no-login tool. The two highest-value targets are:

1. The **`POST /api/pdf`** endpoint, which renders attacker-controlled Markdown
   in a server-side headless Chrome and returns a PDF.
2. The **client preview**, which renders Markdown as HTML in the user's browser.

### Attack surface and mitigations

| # | Risk | Vector | Mitigation | Status |
|---|------|--------|------------|--------|
| 1 | **SSRF** | Markdown image/resource URLs are fetched server-side by Chrome during PDF render. An attacker could target cloud metadata (169.254.169.254), `localhost`, or internal hosts. | Request interception: only `image` resources are allowed; URLs are validated against private/reserved IP ranges (with DNS resolution); non-http(s) protocols and `file:`/`ftp:` are blocked. | Implemented |
| 2 | **Local file read** | `file://` URLs in `<img>`/resources. | Only `http(s)` and `data:` image requests allowed; everything else aborted. | Implemented |
| 3 | **Stored/Reflected XSS** | Raw HTML / `<script>` / event handlers / `javascript:` URLs in Markdown. | `rehype-sanitize` with a constrained schema (no `style`, no scripts, safe URL protocols); same sanitized HTML drives preview and PDF. | Implemented |
| 4 | **DoS / cost abuse** | Hammering the expensive Chrome endpoint, or a small input that yields a huge document. | Per-IP rate limit, 1 MB input cap, JS disabled in the render, render timeout, `maxDuration` cap. Distributed limiting via WAF/Upstash is a follow-up. | Implemented (single-instance) |
| 5 | **Resource injection in JS** | Malicious JS in the rendered page reaching the network or `file:`. | `page.setJavaScriptEnabled(false)` for the PDF render (our HTML is fully static). | Implemented |
| 6 | **HTTP response header injection** | CRLF/quotes in the `filename` reaching `Content-Disposition`. | Filename sanitized to `[a-z0-9-_ ]`, length-capped. | Implemented |
| 7 | **Clickjacking** | Embedding the editor in an attacker iframe. | `frame-ancestors 'none'` + `X-Frame-Options: DENY`. | Implemented |
| 8 | **MIME sniffing / mixed content** | Content-type confusion. | `X-Content-Type-Options: nosniff`, HSTS, CSP. | Implemented |
| 9 | **Info disclosure** | Stack traces / internal errors leaking to clients. | Generic error responses; details logged server-side only. | Implemented |
| 10 | **Supply chain** | Vulnerable dependencies. | `npm audit` in CI, Dependabot. | Planned |
| 11 | **Auth/data (when enabled)** | Supabase documents accessed across users. | Row-Level Security policies (in `supabase/schema.sql`); anon key only on the client; service-role key never shipped. | Implemented (scaffold) |

## Implemented controls

- **SSRF guard** (`src/lib/ssrf.ts` + request interception in `src/app/api/pdf/route.ts`).
- **Rate limiting** (`src/lib/rate-limit.ts`) keyed by client IP.
- **Hardened render**: JavaScript disabled, request interception, render timeout.
- **Input validation**: 1 MB body cap, page-size enum, margin regex, filename allowlist.
- **Output sanitization**: `rehype-sanitize` constrained schema.
- **Security headers** (`next.config.ts`): CSP, HSTS, `X-Frame-Options`,
  `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`.

## Planned / recommended follow-ups

- **Distributed rate limiting** with Upstash Redis or the Vercel WAF
  (the in-process limiter only protects a single instance).
- **Bot protection** via Vercel BotID / WAF managed rules on `/api/pdf`.
- **Nonce-based strict CSP** for scripts (currently `'unsafe-inline'` to keep
  the framework working without per-request nonces).
- **Render concurrency cap** and queueing to bound memory under load.
- **Dependabot + `npm audit` gate** in CI; scheduled review. (Known: two
  moderate advisories come from `postcss` bundled inside Next's build toolchain,
  not reachable from app runtime; `audit fix --force` would downgrade Next, so
  we wait for the upstream bump rather than regress.)
- **Abuse monitoring / alerting** on 4xx/5xx spikes.
