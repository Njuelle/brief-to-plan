import { RunnableConfig } from "@langchain/core/runnables";
import { BaseAgent } from "../core/base.agent";
import { AppState, StateDiff } from "../core/types";

export class ArchitecturerAgent extends BaseAgent {
  name() {
    return "architecture";
  }

  async run(state: AppState, config?: RunnableConfig): Promise<StateDiff> {
    const threadId = config?.configurable?.thread_id as string | undefined;
    this.log("start", threadId);

    const prompt = `You are a pragmatic senior software architect designing a production-ready system.
Technical analysis:
"${state.expandedBrief}"

IMPORTANT architectural principles:
- START SIMPLE: Prefer monolith or modular monolith architecture (avoid microservices complexity unless absolutely necessary)
- USE RELATIONAL DATABASES: PostgreSQL or MySQL as primary datastore (avoid NoSQL unless there's a specific, justified use case)
- Design for modularity within the monolith (clear boundaries, dependency injection)
- Only suggest distributed systems if scale truly requires it (and provide clear justification)

Objective:
- Define the system architecture (prefer monolith/modular monolith, justify if suggesting otherwise)
- Specify core modules/components and their interactions within the application
- Design data layer: relational database schema design (PostgreSQL/MySQL), migrations strategy, indexing
- Caching strategy if needed (Redis/Memcached for specific use cases)
- Define infrastructure requirements (compute, storage, networking, CDN if needed)
- Specify authentication/authorization mechanisms (sessions, OAuth2, JWT, RBAC)
- Outline API design (REST is usually sufficient, justify GraphQL if suggested)
- Define deployment strategy (containerization with Docker, simple orchestration, CI/CD pipeline)
- Specify observability stack (logging, metrics, tracing, alerting)
- Address scalability through vertical scaling first, then horizontal (load balancing, read replicas)
- Identify technical constraints and trade-offs with pragmatic solutions

Answer with 10-20 detailed technical bullet points covering architecture layers, tech stack, and infrastructure.
Remember: Simple, boring technology is usually the right choice.`;
    const architecture = await this.ask(prompt);

    this.log("done", threadId);
    return {
      architectureDesign: architecture,
      messages: this.aiNote("Technical architecture ready."),
    };
  }
}
