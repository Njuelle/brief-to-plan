import { Annotation, MemorySaver, StateGraph } from "@langchain/langgraph";
import { BaseMessage } from "@langchain/core/messages";
import { LLMClient } from "../core/llm.client";
import { ExtendBriefAgent } from "../agents/extend-brief.agent";
import { UserStoriesAgent } from "../agents/user-stories.agent";
import { PlanBackendTasksAgent } from "../agents/plan-backend-tasks.agent";
import { PlanFrontendTasksAgent } from "../agents/plan-frontend-tasks.agent";
import { ArchitectureAgent } from "../agents/architecture.agent";

export class BriefToPlanGraph {
  private readonly llmFactory = new LLMClient();
  private readonly extend = new ExtendBriefAgent(this.llmFactory);
  private readonly userStories = new UserStoriesAgent(this.llmFactory);
  private readonly architecture = new ArchitectureAgent(this.llmFactory);
  private readonly planBackend = new PlanBackendTasksAgent(this.llmFactory);
  private readonly planFrontend = new PlanFrontendTasksAgent(this.llmFactory);

  private readonly Checkpoint = new MemorySaver();

  // Annotation Root = state typing for LangGraph
  private readonly State = Annotation.Root({
    messages: Annotation<BaseMessage[]>({
      reducer: (left, right) => (left ?? []).concat(right ?? []),
      default: () => [],
    }),
    brief: Annotation<string>(),
    expandedBrief: Annotation<string>(),
    userStoryList: Annotation<any>(),
    architectureDesign: Annotation<string>(),
    backendTasks: Annotation<string[]>(),
    frontendTasks: Annotation<string[]>(),
    backendPlan: Annotation<any>(),
    frontendPlan: Annotation<any>(),
    reformulated: Annotation<string>(),
  });

  /** Expose the compiled graph */
  compile() {
    const graph = new StateGraph(this.State)
      .addNode(this.extend.name(), (state, config) =>
        this.extend.run(state, config)
      )
      .addNode(this.userStories.name(), (state, config) =>
        this.userStories.run(state, config)
      )
      .addNode(this.architecture.name(), (state, config) =>
        this.architecture.run(state, config)
      )
      .addNode(this.planBackend.name(), (state, config) =>
        this.planBackend.run(state, config)
      )
      .addNode(this.planFrontend.name(), (state, config) =>
        this.planFrontend.run(state, config)
      )
      .addEdge("__start__", this.extend.name())
      .addEdge(this.extend.name(), this.userStories.name())
      .addEdge(this.userStories.name(), this.architecture.name())
      .addEdge(this.architecture.name(), this.planBackend.name())
      .addEdge(this.architecture.name(), this.planFrontend.name())
      .addEdge(this.planBackend.name(), "__end__")
      .addEdge(this.planFrontend.name(), "__end__");

    return graph.compile({ checkpointer: this.Checkpoint });
  }
}
