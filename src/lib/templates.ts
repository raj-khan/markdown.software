export type Template = {
  id: string;
  name: string;
  description: string;
  content: string;
};

export const DEFAULT_DOC = `# Hi 👋 - welcome to markdowntopdf.sh

> New here? Just clear this text and start writing your own, then **Export PDF**. What you see is exactly what prints.



## Author
<img src="https://github.com/raj-khan.png" alt="Meher Ullah Khan Raj" width="120" height="120" />


I'm **Meher Ullah Khan Raj**, a software engineer, building SaaS
tools, developer workflow automation, and open-source projects. I built this **Markdown → PDF** tool so anyone can turn plain text into a polished document, and it's **free, open source, no sign-up required.**


### Find me here
* **GitHub** - https://github.com/raj-khan
* **LinkedIn** - https://www.linkedin.com/in/raajkhan/
* **Medium** - https://rajkhaan.medium.com/

If this is useful, a ⭐ on [GitHub](https://github.com/raj-khan/markdown.software)
means a lot - and contributions are very welcome.`;

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
