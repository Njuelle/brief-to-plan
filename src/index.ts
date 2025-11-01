import "dotenv/config";
import { randomUUID } from "node:crypto";
import { writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { BriefToPlanGraph } from "./workflow/brief-to-plan.workflow";
import { MarkdownFormatter } from "./utils/markdown-formatter";

function parseBrief(): string {
  const args = process.argv.slice(2);

  // Look for --brief flag
  const briefIndex = args.findIndex(arg => arg === "--brief" || arg === "-b");

  if (briefIndex === -1 || briefIndex === args.length - 1) {
    console.error("\n❌ Error: Missing required parameter --brief\n");
    console.log("Usage:");
    console.log("  npm start -- --brief \"Your project description here\"");
    console.log("  npm start -- -b \"Your project description here\"");
    console.log("  tsx src/index.ts --brief \"Your project description here\"\n");
    process.exit(1);
  }

  // Get everything after --brief as the brief text
  const brief = args.slice(briefIndex + 1).join(" ");

  if (!brief.trim()) {
    console.error("\n❌ Error: Brief cannot be empty\n");
    process.exit(1);
  }

  return brief.trim();
}

async function main() {
  const userBrief = parseBrief();

  console.log("\n🚀 Starting technical plan generation...\n");

  const app = new BriefToPlanGraph().compile();

  // IMPORTANT: provide a thread_id when a checkpointer is active
  const threadId = process.env.THREAD_ID || randomUUID();

  const result = await app.invoke(
    { brief: userBrief },
    { configurable: { thread_id: threadId } }
  );

  // Format and save as markdown
  const formatter = new MarkdownFormatter();
  const markdown = formatter.format(result);
  const compact = formatter.formatCompact(result);

  // Create output directory if it doesn't exist
  const outputDir = join(process.cwd(), "output");
  mkdirSync(outputDir, { recursive: true });

  // Save markdown file with timestamp
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const filename = `plan-${timestamp}.md`;
  const filepath = join(outputDir, filename);

  writeFileSync(filepath, markdown, "utf-8");

  // Display compact summary in console
  console.log(compact);
  console.log(`\n✅ Full plan saved to: ${filepath}\n`);
}

main().catch((e) => {
  console.error("\n❌ Error:", e.message);
  process.exit(1);
});
