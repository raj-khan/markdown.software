"use client";

import "github-markdown-css/github-markdown-light.css";
import "highlight.js/styles/github.css";
import { useMemo } from "react";
import { renderMarkdown } from "@/lib/markdown";
import { useEditorStore } from "@/lib/store";

export function Preview({ markdown }: { markdown: string }) {
	const html = useMemo(() => renderMarkdown(markdown), [markdown]);
	const pressing = useEditorStore((s) => s.pressing);

	return (
		<div className="thin-scroll h-full overflow-auto bg-canvas">
			<div className="mx-auto max-w-3xl px-6 py-10 sm:px-10 sm:py-14">
				<div className="crop-sheet relative">
					<span className="crop-corner-tr" aria-hidden />
					<span className="crop-corner-bl" aria-hidden />
					<div
						className={`markdown-body rounded-sm border border-line p-7 shadow-[0_1px_2px_rgba(26,26,33,0.04),0_12px_32px_-12px_rgba(26,26,33,0.18)] sm:p-12 ${
							pressing ? "is-pressing" : ""
						}`}
						style={{ transformOrigin: "center" }}
						// Sanitized in renderMarkdown via rehype-sanitize.
						dangerouslySetInnerHTML={{ __html: html }}
					/>
				</div>
			</div>
		</div>
	);
}
