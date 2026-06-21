"use client";

import { useEffect, useRef, useState } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import { DocControls } from "./DocControls";

export function SettingsMenu() {
	const [open, setOpen] = useState(false);
	const containerRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (!open) return;
		function onKey(e: KeyboardEvent) {
			if (e.key === "Escape") setOpen(false);
		}
		function onClick(e: MouseEvent) {
			if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
		}
		document.addEventListener("keydown", onKey);
		document.addEventListener("mousedown", onClick);
		return () => {
			document.removeEventListener("keydown", onKey);
			document.removeEventListener("mousedown", onClick);
		};
	}, [open]);

	return (
		<div ref={containerRef} className="relative">
			<button
				type="button"
				aria-label="Document settings"
				aria-haspopup="dialog"
				aria-expanded={open}
				onClick={() => setOpen((v) => !v)}
				className="focus-ring flex h-9 w-9 items-center justify-center rounded-md border border-shell-line text-chalk-dim transition-colors hover:border-chalk-dim hover:text-chalk"
			>
				<SlidersHorizontal size={18} />
			</button>

			{open && (
				<div
					role="dialog"
					aria-label="Document settings"
					className="absolute right-0 z-20 mt-2 w-64 rounded-xl border border-shell-line bg-shell-raised p-4 shadow-xl"
				>
					<div className="mb-3 flex items-center justify-between">
						<h2 className="font-display text-sm font-medium text-chalk">
							Settings
						</h2>
						<button
							type="button"
							aria-label="Close settings"
							onClick={() => setOpen(false)}
							className="focus-ring flex h-7 w-7 items-center justify-center rounded-md text-chalk-dim hover:bg-shell hover:text-chalk"
						>
							<X size={16} />
						</button>
					</div>
					<DocControls variant="stacked" />
				</div>
			)}
		</div>
	);
}
