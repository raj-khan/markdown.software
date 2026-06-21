export type Template = {
  id: string;
  name: string;
  description: string;
  content: string;
};

export const DEFAULT_DOC = `# Markdown to PDF

Write **Markdown** on the left, see a live preview on the right, and
download a polished **PDF** with one click.

> Open source. Free. No sign-up required. — [markdowntopdf.sh](https://www.markdowntopdf.sh)

## Features

- GitHub Flavored Markdown (tables, task lists, strikethrough)
- Syntax-highlighted code blocks
- Live preview as you type
- High-quality, vector-text PDF export

## A code sample

\`\`\`ts
function greet(name: string): string {
  return \`Hello, \${name}!\`;
}

console.log(greet("world"));
\`\`\`

## A table

| Feature        | Status |
| -------------- | :----: |
| Live preview   |   ✅   |
| PDF export     |   ✅   |
| Open source    |   ✅   |

## A task list

- [x] Type some Markdown
- [x] Watch the preview update
- [ ] Download your PDF

---

Made with care. Replace this text with your own and export away.
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

### Senior Engineer — Acme Inc. (2022 – Present)

- Led migration of the billing system, cutting latency by 40%.
- Mentored four engineers and ran the frontend guild.

### Engineer — Globex (2019 – 2022)

- Built the public API used by 10k+ developers.

## Education

**B.S. Computer Science** — State University (2019)

## Skills

TypeScript · React · Node.js · PostgreSQL · Go
`,
  },
];
