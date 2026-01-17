import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";

export default function (pi: ExtensionAPI) {
	pi.registerShortcut("ctrl+x", {
		description: "Clear screen",
		handler: async (ctx) => {
			ctx.ui.clearScreen();
		},
	});
}
