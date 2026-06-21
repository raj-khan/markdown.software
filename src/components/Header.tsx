"use client";

import { useEffect } from "react";
import Link from "next/link";
import { FileDown, Loader2, CheckCircle2, AlertCircle, X } from "lucide-react";
import { DocControls } from "./DocControls";
import { SettingsMenu } from "./SettingsMenu";
import { useExport } from "@/lib/use-export";

const GITHUB_URL = "https://github.com/raj-khan/markdown.software";

/** A print registration target — the mark a press operator lines up by. */
function RegistrationMark({ size = 20 }: { size?: number }) {
	return (
		<svg width={size} height={size} viewBox="0 0 20 20" aria-hidden="true">
			<circle
				cx="10"
				cy="10"
				r="5"
				fill="none"
				stroke="var(--color-rust)"
				strokeWidth="1.25"
			/>
			<line
				x1="10"
				y1="0"
				x2="10"
				y2="20"
				stroke="var(--color-rust)"
				strokeWidth="1.25"
			/>
			<line
				x1="0"
				y1="10"
				x2="20"
				y2="10"
				stroke="var(--color-rust)"
				strokeWidth="1.25"
			/>
		</svg>
	);
}

function GithubIcon({ size = 18 }: { size?: number }) {
	return (
		<svg
			width={size}
			height={size}
			viewBox="0 0 24 24"
			fill="currentColor"
			aria-hidden="true"
		>
			<path d="M12 .5C5.73.5.5 5.73.5 12a11.5 11.5 0 0 0 7.86 10.92c.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.37-3.88-1.37-.53-1.34-1.3-1.7-1.3-1.7-1.06-.72.08-.71.08-.71 1.17.08 1.79 1.2 1.79 1.2 1.04 1.79 2.73 1.27 3.4.97.1-.76.41-1.27.74-1.56-2.55-.29-5.23-1.28-5.23-5.7 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.46.11-3.05 0 0 .98-.31 3.2 1.18a11.1 11.1 0 0 1 5.83 0c2.22-1.49 3.2-1.18 3.2-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.84 1.19 3.1 0 4.43-2.69 5.41-5.25 5.69.42.36.79 1.07.79 2.16v3.2c0 .31.21.67.8.56A11.5 11.5 0 0 0 23.5 12C23.5 5.73 18.27.5 12 .5Z" />
		</svg>
	);
}

export function Header() {
	const { exportPdf, busy, status, dismiss } = useExport();

	// Global export shortcuts: ⌘S / Ctrl+S and ⇧⌘E / Ctrl+Shift+E.
	useEffect(() => {
		function onKey(e: KeyboardEvent) {
			const mod = e.metaKey || e.ctrlKey;
			if (!mod) return;
			const k = e.key.toLowerCase();
			if (k === "s" || (e.shiftKey && k === "e")) {
				e.preventDefault();
				void exportPdf();
			}
		}
		window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	}, [exportPdf]);

	return (
		<header className="flex items-center justify-between gap-3 border-b border-shell-line bg-shell px-3 py-2.5 sm:px-4">
			<Link href="/" className="focus-ring flex items-center gap-2.5 rounded">
				<RegistrationMark />
				<span className="leading-none">
					<span className="font-display text-[17px] font-medium tracking-tight text-chalk">
						markdowntopdf<span className="text-rust">.sh</span>
					</span>
					<span className="mt-0.5 hidden text-[11px] tracking-wide text-chalk-dim lg:block">
						a typesetting bench for plain text
					</span>
				</span>
			</Link>

			<div className="flex items-center gap-2">
				<div className="hidden lg:flex">
					<DocControls variant="inline" />
				</div>
				<div className="lg:hidden">
					<SettingsMenu />
				</div>

				<a
					href={GITHUB_URL}
					target="_blank"
					rel="noreferrer"
					title="View source on GitHub"
					aria-label="View source on GitHub"
					className="focus-ring hidden h-9 w-9 items-center justify-center rounded-md border border-shell-line text-chalk-dim transition-colors hover:border-chalk-dim hover:text-chalk sm:flex"
				>
					<GithubIcon size={18} />
				</a>

				<button
					type="button"
					onClick={() => void exportPdf()}
					disabled={busy}
					title="Export PDF  ⇧⌘E"
					className="focus-ring flex h-9 items-center gap-2 rounded-md bg-rust px-3.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-rust-strong disabled:cursor-not-allowed disabled:opacity-60"
				>
					{busy ? (
						<Loader2 size={16} className="animate-spin" />
					) : (
						<FileDown size={16} />
					)}
					<span className="hidden sm:inline">
						{busy ? "Exporting…" : "Export PDF"}
					</span>
					<span className="sm:hidden">{busy ? "…" : "PDF"}</span>
				</button>
			</div>

			{status && (
				<div
					role={status.type === "error" ? "alert" : "status"}
					className={`fixed inset-x-0 bottom-5 z-30 mx-auto flex w-[min(92%,26rem)] items-center gap-2.5 rounded-lg border px-3.5 py-3 text-sm shadow-lg ${
						status.type === "error"
							? "border-red-200 bg-red-50 text-red-800"
							: "border-line bg-paper text-ink"
					}`}
				>
					{status.type === "error" ? (
						<AlertCircle size={18} className="shrink-0 text-red-500" />
					) : (
						<CheckCircle2 size={18} className="shrink-0 text-rust" />
					)}
					<p className="flex-1">{status.message}</p>
					<button
						type="button"
						aria-label="Dismiss"
						onClick={dismiss}
						className="focus-ring shrink-0 rounded text-ink-soft hover:text-ink"
					>
						<X size={16} />
					</button>
				</div>
			)}
		</header>
	);
}
