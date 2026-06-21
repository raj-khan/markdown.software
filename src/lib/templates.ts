export type Template = {
  id: string;
  name: string;
  description: string;
  content: string;
};

export const DEFAULT_DOC = `# Hi 👋 - welcome to markdowntopdf.sh

I built this **Markdown → PDF** tool so anyone can turn plain text into a
polished document - **free, open source, no sign-up.**

Type on the left, watch it set on the page to the right, then **Export PDF**
(or press ⇧⌘E). What you see is exactly what prints.

> New here? Just clear this text and start writing your own.

## What you can do

- **GitHub-Flavored Markdown** - tables, task lists, footnotes, strikethrough
- **Syntax-highlighted** code blocks
- **Live preview** that matches the exported PDF exactly
- **Page options** - A4 / Letter / Legal / A3 and custom margins
- Templates, autosave, keyboard shortcuts, and a resizable / focus editor

\`\`\`ts
// your code is typeset, too
export const greet = (name: string): string => \`Hello, \${name}!\`;
\`\`\`

## A quick demo

| Feature      | Status |
| ------------ | :----: |
| Live preview |   ✅   |
| PDF export   |   ✅   |
| Open source  |   ✅   |

- [x] Type some Markdown
- [x] Watch the preview update
- [ ] Export your PDF

## Coming soon

1. Optional accounts with **cloud-saved documents**, so your work follows you
2. Shareable links to your pages

---

## Built by Raj

<img src="https://github.com/raj-khan.png" alt="Meher Ullah Khan Raj" width="120" height="120" />

I'm **Meher Ullah Khan Raj**, a software engineer in Kuala Lumpur building SaaS
tools, developer-workflow automation, and open-source projects.

- **GitHub** - https://github.com/raj-khan
- **LinkedIn** - https://www.linkedin.com/in/raajkhan/
- **Medium** - https://rajkhaan.medium.com/

If this is useful, a ⭐ on [GitHub](https://github.com/raj-khan/markdown.software)
means a lot - and contributions are very welcome.

## Built with

[Next.js](https://nextjs.org) · [Tailwind CSS](https://tailwindcss.com) · [unified / remark](https://unifiedjs.com) · [Puppeteer](https://pptr.dev) - open source under MIT, hosted on [Vercel](https://vercel.com).
`;

export const TEMPLATES: Template[] = [
  {
    id: "blank",
    name: "Blank",
    description: "Start from an empty document.",
    content: "# Untitled\n\n",
  },
  {
    id: "default",
    name: "Welcome",
    description: "The intro document with examples.",
    content: DEFAULT_DOC,
  },
  {
    id: "readme",
    name: "Project README",
    description: "A starter README for an open-source project.",
    content: `# Project Name

One-line description of what this project does.

## Installation

\`\`\`bash
npm install project-name
\`\`\`

## Usage

\`\`\`ts
import { thing } from "project-name";

thing();
\`\`\`

## Contributing

Contributions are welcome! Please open an issue first to discuss changes.

## License

MIT
`,
  },
  {
    id: "resume",
    name: "Resume",
    description: "A clean one-page resume.",
    content: `# Jane Doe

**Software Engineer** · jane@example.com · github.com/janedoe

## Experience

### Senior Engineer - Acme Inc. (2022 - Present)

- Led migration of the billing system, cutting latency by 40%.
- Mentored four engineers and ran the frontend guild.

### Engineer - Globex (2019 - 2022)

- Built the public API used by 10k+ developers.

## Education

**B.S. Computer Science** - State University (2019)

## Skills

TypeScript · React · Node.js · PostgreSQL · Go
`,
  },
];
