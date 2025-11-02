import { RunnableConfig } from "@langchain/core/runnables";
import { BaseAgent } from "../core/base.agent";
import { AppState, StateDiff } from "../core/types";

export class ExtendBriefAgent extends BaseAgent {
  name() {
    return "extendBrief";
  }

  async run(state: AppState, config?: RunnableConfig): Promise<StateDiff> {
    const threadId = config?.configurable?.thread_id as string | undefined;
    this.log("start", threadId);

    const prompt = `You are a product analyst helping to clarify and extend a project brief.

Initial brief:
"${state.brief}"

Your objective is to extend and clarify this brief from a PRODUCT and USER perspective:
- What is the main problem this project is solving?
- Who are the target users/audience?
- What are the key features and functionality needed?
- What is the expected user experience?
- What are the business goals and success metrics?
- Are there any important constraints or requirements (regulatory, accessibility, platform-specific)?
- What is the expected scope (MVP vs full product)?

Provide 6-12 clear bullet points that expand on the brief, focusing on WHAT needs to be built and WHY, not HOW to build it technically.
Keep it product-focused and user-centric.`;

    const expanded = await this.ask(prompt);

    this.log("done", threadId);
    return {
      expandedBrief: expanded,
      messages: this.aiNote("Extended brief ready."),
    };
  }
}
