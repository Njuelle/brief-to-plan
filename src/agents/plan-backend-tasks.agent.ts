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

IMPORTANT - Structure Guidelines:
Create 2-4 EPICs maximum. Each EPIC contains multiple STORIES. Each STORY contains multiple TASKS.
The hierarchy is strictly: EPIC > STORY > TASK (exactly 3 levels, no more, no less).

Example structure:
Epic 1: "User Management"
  Story 1.1: "User Authentication"
    Task 1.1.1: "Create user registration endpoint"
    Task 1.1.2: "Implement JWT middleware"
  Story 1.2: "User Profile"
    Task 1.2.1: "Create profile update endpoint"

Requirements for each task:
- goal: Technical objective (e.g., "Implement authentication middleware with JWT validation")
- deliverable: Concrete output (e.g., "auth.middleware.ts with unit tests", "users migration file")
- deps: List of task names this depends on (e.g., ["Database setup", "User model creation"])
- estimate: XS=1-2h, S=2-4h, M=1d, L=2-3d, XL=1week

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

Also provide:
- criticalPath: Array of task names on the critical path
- risks: Array of technical risks identified`;
  }

  async run(state: AppState, config?: RunnableConfig): Promise<StateDiff> {
    const threadId = config?.configurable?.thread_id as string | undefined;
    this.log("start", threadId);

    const plan = await this.askStructured(
      this.buildPrompt(state.expandedBrief ?? ""),
      PlanZ,
      { temperature: 0.3, maxTokens: 4000 }
    );

    const tasks = plan.epics.flatMap((e) =>
      e.stories.flatMap((s) => s.tasks.map((t) => t.name))
    );

    this.log(`produced ${tasks.length} tasks`, threadId);

    return {
      backendTasks: tasks,
      messages: this.aiNote("Backend task plan ready."),
    };
  }
}
