import type { Component } from "@mariozechner/pi-tui";
import { theme } from "../theme/theme.js";

export type DynamicBorderType = "top" | "bottom" | "line";
export type DynamicBorderStyle = "rounded" | "sharp" | "none";

interface BorderChars {
	topLeft: string;
	topRight: string;
	bottomLeft: string;
	bottomRight: string;
}

const BORDER_STYLES: Record<DynamicBorderStyle, BorderChars> = {
	rounded: { topLeft: "╭", topRight: "╮", bottomLeft: "╰", bottomRight: "╯" },
	sharp: { topLeft: "┌", topRight: "┐", bottomLeft: "└", bottomRight: "┘" },
	none: { topLeft: "", topRight: "", bottomLeft: "", bottomRight: "" },
};

/**
 * Dynamic border component that adjusts to viewport width.
 * Supports different styles (rounded, sharp) and positions (top, bottom, line).
 */
export class DynamicBorder implements Component {
	private color: (str: string) => string;
	private type: DynamicBorderType;
	private style: DynamicBorderStyle;

	constructor(
		color: (str: string) => string = (str) => theme.fg("border", str),
		type: DynamicBorderType = "line",
		style: DynamicBorderStyle = "rounded",
	) {
		this.color = color;
		this.type = type;
		this.style = style;
	}

	invalidate(): void {
		// No cached state to invalidate currently
	}

	private formatBorder(text: string): string {
		if (this.type === "line" || text.length <= 1) return text;

		const styleChars = BORDER_STYLES[this.style];
		const leftChar = this.type === "top" ? styleChars.topLeft : styleChars.bottomLeft;
		const rightChar = this.type === "top" ? styleChars.topRight : styleChars.bottomRight;

		if (!leftChar && !rightChar) {
			return text;
		}

		return `${leftChar}${text.slice(1, -1)}${rightChar}`;
	}

	render(width: number): string[] {
		const line = "─".repeat(Math.max(1, width));
		return [this.color(this.formatBorder(line))];
	}
}
