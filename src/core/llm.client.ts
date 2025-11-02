import { openai } from "@ai-sdk/openai";
import { generateObject, generateText } from "ai";
import { z } from "zod";

export class LLMClient {
  constructor(
    private readonly modelName = "gpt-4o",
    private readonly temperature = 0.2
  ) {}

  /** Generate text using Vercel AI SDK */
  async generateText(
    prompt: string,
    options?: { temperature?: number }
  ): Promise<string> {
    const result = await generateText({
      model: openai(this.modelName),
      prompt,
      temperature: options?.temperature ?? this.temperature,
    });
    return result.text;
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
