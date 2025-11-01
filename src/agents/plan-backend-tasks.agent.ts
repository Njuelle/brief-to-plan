import { RunnableConfig } from "@langchain/core/runnables";
import { BaseAgent } from "../core/base.agent";
import { AppState, StateDiff } from "../core/types";
import { PlanZ } from "../schemas/plan.schema";

export class PlanBackendTasksAgent extends BaseAgent {
  name() {
    return "planBackendTasks";
  }

  private buildPrompt(architecture: string) {
    return `You are a senior backend engineer creating a detailed implementation plan.
Architecture and technical requirements:
${architecture}

Requirements:
- Break down into EPIC -> STORIES -> TASKS (max 3 levels) focusing on backend implementation
- Each task must be concrete and technical (API endpoints, database schemas, service implementations, etc.)
- For each task specify:
  * goal: Technical objective (e.g., "Implement authentication middleware with JWT validation")
  * deliverable: Concrete output (e.g., "auth.middleware.ts with unit tests", "users migration file")
  * deps: Technical dependencies (e.g., database setup, external API integration)
  * estimate: Implementation time (XS=1-2h, S=2-4h, M=1d, L=2-3d, XL=1week)

Focus areas:
- Database schema design and migrations
- API endpoint implementation (routes, controllers, middleware)
- Business logic and service layer
- Data validation and error handling
- Security implementation (authentication, authorization, input sanitization)
- Integration with external services/APIs
- Testing (unit tests, integration tests)
- Performance optimization (caching, query optimization, indexing)
- Background jobs/workers if needed
- API documentation (OpenAPI/Swagger)

Answer in STRICT JSON matching this schema:
{
  "epics": [
    {
      "name": "string",
      "stories": [
        {
          "name": "string",
          "tasks": [
            { "name": "string", "goal": "string", "deliverable": "string", "deps": ["string"], "estimate": "XS|S|M|L|XL" }
          ]
        }
      ]
    }
  ],
  "criticalPath": ["string"],
  "risks": ["string"]
}`;
  }

  async run(state: AppState, config?: RunnableConfig): Promise<StateDiff> {
    const threadId = config?.configurable?.thread_id as string | undefined;
    this.log("start", threadId);

    const raw = await this.ask(this.buildPrompt(state.expandedBrief ?? ""));

    // Minimal validation/repair
    let tasks: string[] = [];
    try {
      const jsonStart = raw.indexOf("{");
      const jsonEnd = raw.lastIndexOf("}");
      const candidate =
        jsonStart >= 0 ? raw.slice(jsonStart, jsonEnd + 1) : raw;
      const parsed = PlanZ.parse(JSON.parse(candidate));
      tasks = parsed.epics.flatMap((e) =>
        e.stories.flatMap((s) => s.tasks.map((t) => t.name))
      );
    } catch {
      // Robust fallback (flat list)
      tasks = raw
        .split("\n")
        .map((l) => l.replace(/^-+\s*/, "").trim())
        .filter(Boolean)
        .slice(0, 60);
    }

    this.log(`produced ${tasks.length} tasks`, threadId);

    return {
      backendTasks: tasks,
      messages: this.aiNote("task plan ready."),
    };
  }
}
