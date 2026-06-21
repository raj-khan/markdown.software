"use client";

import "github-markdown-css/github-markdown-light.css";
import "highlight.js/styles/github.css";
import { useEffect, useMemo, useRef } from "react";
import { renderMarkdown } from "@/lib/markdown";
import { useEditorStore } from "@/lib/store";

export function Preview({ markdown }: { markdown: string }) {
	const html = useMemo(() => renderMarkdown(markdown), [markdown]);
	const pressing = useEditorStore((s) => s.pressing);
	const bodyRef = useRef<HTMLDivElement>(null);

	// Replace images that fail to load with a clear, actionable message.
	// The most common cause is pasting a web-page URL (e.g. an Unsplash photo
	// page) instead of a direct link to an image file.
	useEffect(() => {
		const root = bodyRef.current;
		if (!root) return;

		function flag(img: HTMLImageElement) {
			if (img.dataset.failed) return;
			img.dataset.failed = "1";
			const note = document.createElement("span");
			note.className = "img-broken";
			const alt = img.getAttribute("alt")?.trim();
			note.textContent = `Couldn't load image${
				alt ? ` “${alt}”` : ""
			} - make sure the URL links directly to an image file (.png, .jpg, …).`;
			img.replaceWith(note);
		}

		function onError(e: Event) {
			const target = e.target as HTMLElement | null;
			if (target?.tagName === "IMG") flag(target as HTMLImageElement);
		}

		// `error` doesn't bubble, so listen in the capture phase. Also sweep any
		// images that already finished loading broken before this ran.
		root.addEventListener("error", onError, true);
		root.querySelectorAll("img").forEach((img) => {
			if (img.complete && img.naturalWidth === 0) flag(img);
		});

		return () => root.removeEventListener("error", onError, true);
	}, [html]);

	return (
		<div className="thin-scroll h-full overflow-auto bg-canvas">
			<div className="mx-auto max-w-3xl px-6 py-10 sm:px-10 sm:py-14">
				<div className="crop-sheet relative">
					<span className="crop-corner-tr" aria-hidden />
					<span className="crop-corner-bl" aria-hidden />
					<div
						ref={bodyRef}
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
