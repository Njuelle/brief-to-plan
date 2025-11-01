import { ChatOpenAI } from "@langchain/openai";
import { openai } from "@ai-sdk/openai";
import { generateObject } from "ai";
import { z } from "zod";

export class LLMClient {
  constructor(
    private readonly modelName = "gpt-4o",
    private readonly temperature = 0.2
  ) {}

  /** Create LangChain client for text generation */
  create() {
    return new ChatOpenAI({
      model: this.modelName,
      temperature: this.temperature,
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  /** Generate structured output using Vercel AI SDK */
  async generateStructured<T>(
    prompt: string,
    schema: z.ZodSchema<T>,
    options?: { maxTokens?: number; temperature?: number }
  ): Promise<T> {
    const result = await generateObject({
      model: openai(this.modelName),
      schema,
      prompt,
      temperature: options?.temperature ?? this.temperature,
      maxTokens: options?.maxTokens,
    });
    return result.object;
  }
}
