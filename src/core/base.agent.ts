import { RunnableConfig } from "@langchain/core/runnables";
import { AIMessage, HumanMessage } from "@langchain/core/messages";
import { AppState, StateDiff } from "./types";
import { LLMClient } from "./llm.client";
import { z } from "zod";

export abstract class BaseAgent {
  protected llm = this.llmFactory.create();

  constructor(protected readonly llmFactory: LLMClient) {}

  /** Stable name of the node in the graph */
  abstract name(): string;

  /** Concrete implementation of the agent (returns a state diff) */
  abstract run(state: AppState, config?: RunnableConfig): Promise<StateDiff>;

  /** Utility to respond simply with a prompt */
  protected async ask(prompt: string) {
    const msg = await this.llm.invoke([new HumanMessage(prompt)]);
    return String(msg.content ?? "");
  }

  /** Utility to get structured output with Vercel AI SDK */
  protected async askStructured<T>(
    prompt: string,
    schema: z.ZodSchema<T>,
    options?: { maxTokens?: number; temperature?: number }
  ): Promise<T> {
    return this.llmFactory.generateStructured(prompt, schema, options);
  }

  /** Small helper for logging */
  protected log(step: string, threadId?: string) {
    const tag = threadId ? `[${this.name()}|${threadId}]` : `[${this.name()}]`;
    // eslint-disable-next-line no-console
    console.log(`${tag} ${step}`);
  }

  protected aiNote(text: string) {
    return [new AIMessage(text)];
  }
}
