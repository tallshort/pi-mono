import { describe, expect, it, vi } from "vitest";
import { streamOpenAICompletions } from "../src/providers/openai-completions.js";
import type { Model } from "../src/types.js";

// Mock the OpenAI client
const mockCreate = async function* (params: any) {
	if (params.model === "minimax-split") {
		yield {
			id: "chatcmpl-split",
			choices: [{ delta: { content: "Start <th" }, index: 0, finish_reason: null }],
		};
		yield {
			id: "chatcmpl-split",
			choices: [{ delta: { content: "ink>thinking</" }, index: 0, finish_reason: null }],
		};
		yield {
			id: "chatcmpl-split",
			choices: [{ delta: { content: "think> End" }, index: 0, finish_reason: null }],
		};
		yield {
			id: "chatcmpl-split",
			choices: [{ delta: {}, index: 0, finish_reason: "stop" }],
		};
		return;
	}

	yield {
		id: "chatcmpl-123",
		object: "chat.completion.chunk",
		created: 1694268190,
		model: "minimax-m2.1",
		choices: [
			{
				index: 0,
				delta: { content: "Here is my thought process: <think>This is a thought.</think> And here is the answer." },
				finish_reason: null,
			},
		],
	};
	yield {
		id: "chatcmpl-123",
		object: "chat.completion.chunk",
		created: 1694268190,
		model: "minimax-m2.1",
		choices: [
			{
				index: 0,
				delta: {},
				finish_reason: "stop",
			},
		],
	};
};

// Mock the OpenAI constructor
vi.mock("openai", () => {
	return {
		default: class OpenAI {
			chat = {
				completions: {
					create: mockCreate,
				},
			};
		},
	};
});

describe("NVIDIA Thinking Tag Parsing", () => {
	it("should parse <think> tags when using NVIDIA base URL", async () => {
		const model: Model<"openai-completions"> = {
			id: "minimax-m2.1",
			name: "MiniMax M2.1",
			api: "openai-completions",
			provider: "nvidia",
			baseUrl: "https://integrate.api.nvidia.com/v1",
			reasoning: true,
			input: ["text"],
			cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
			contextWindow: 32000,
			maxTokens: 4096,
		};

		const stream = streamOpenAICompletions(model, { messages: [] }, { apiKey: "test" });
		const events: any[] = [];

		for await (const event of stream) {
			events.push(event);
		}

		// Verify we got a done event with the correct structure
		const errorEvent = events.find((e) => e.type === "error");
		if (errorEvent) {
			console.error("Received error event:", JSON.stringify(errorEvent, null, 2));
		}

		const doneEvent = events.find((e) => e.type === "done");
		expect(doneEvent).toBeDefined();

		// Verify streaming events
		const thinkingStart = events.find((e) => e.type === "thinking_start");
		expect(thinkingStart).toBeDefined();

		const textDeltas = events.filter((e) => e.type === "text_delta");
		const fullTextStream = textDeltas.map((e) => e.delta).join("");
		expect(fullTextStream).not.toContain("<think>");
		expect(fullTextStream).not.toContain("</think>");
		expect(fullTextStream).toContain("Here is my thought process: ");
		expect(fullTextStream).toContain(" And here is the answer.");

		const thinkingDeltas = events.filter((e) => e.type === "thinking_delta");
		const fullThinkingStream = thinkingDeltas.map((e) => e.delta).join("");
		expect(fullThinkingStream).toBe("This is a thought.");

		const content = doneEvent.message.content;
		const thinkingBlock = content.find((c: any) => c.type === "thinking");
		expect(thinkingBlock).toBeDefined();
		expect(thinkingBlock.thinking).toBe("This is a thought.");

		const textBlocks = content.filter((c: any) => c.type === "text");
		expect(textBlocks.length).toBeGreaterThan(0);
		const combinedText = textBlocks.map((c: any) => c.text).join("");
		expect(combinedText).toContain("Here is my thought process: ");
		expect(combinedText).toContain(" And here is the answer.");
		expect(combinedText).not.toContain("<think>");
	});

	it("should handle split tags across chunks", async () => {
		const model: Model<"openai-completions"> = {
			id: "minimax-split",
			name: "MiniMax Split",
			api: "openai-completions",
			provider: "nvidia",
			baseUrl: "https://integrate.api.nvidia.com/v1",
			reasoning: true,
			input: ["text"],
			cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
			contextWindow: 32000,
			maxTokens: 4096,
		};

		const stream = streamOpenAICompletions(model, { messages: [] }, { apiKey: "test" });
		const events: any[] = [];

		for await (const event of stream) {
			events.push(event);
		}

		const textDeltas = events.filter((e) => e.type === "text_delta");
		const fullTextStream = textDeltas.map((e) => e.delta).join("");
		// "Start <th" -> emits "Start "
		// "ink>thinking</" -> emits nothing (switches to thinking, collects "thinking")
		// "think> End" -> emits " End" (after </think>)
		expect(fullTextStream).toBe("Start  End");

		const thinkingDeltas = events.filter((e) => e.type === "thinking_delta");
		const fullThinkingStream = thinkingDeltas.map((e) => e.delta).join("");
		expect(fullThinkingStream).toBe("thinking");
	});
});
