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

    const prompt = `You are a senior technical lead analyzing requirements for implementation.
Initial brief:
"${state.brief}"

Objective:
- Analyze technical requirements and constraints (performance, scalability, security)
- Identify system boundaries, data flows, and integration points
- List technical assumptions, dependencies on external systems/APIs
- Define technical success criteria (latency, throughput, reliability metrics)
- Highlight technical risks and mitigation strategies
- Specify non-functional requirements (observability, monitoring, error handling)
Answer with 8-15 concise technical bullet points focused on implementation concerns.`;

    const expanded = await this.ask(prompt);

    this.log("done", threadId);
    return {
      expandedBrief: expanded,
      messages: this.aiNote("Extended brief ready."),
    };
  }
}
