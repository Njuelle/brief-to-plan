import { RunnableConfig } from "@langchain/core/runnables";
import { BaseAgent } from "../core/base.agent";
import { AppState, StateDiff } from "../core/types";
import { PlanZ } from "../schemas/plan.schema";

export class PlanBackendTasksAgent extends BaseAgent {
  name() {
    return "planBackendTasks";
  }

  private buildPrompt(architecture: string, userStoryList: string) {
    return `You are a senior backend engineer creating a detailed implementation plan.

Architecture design:
${architecture}

User stories:
${userStoryList}

IMPORTANT - Structure Guidelines:
Create technical implementation epics and stories that align with the user stories above.
Each EPIC contains multiple STORIES. Each STORY contains multiple TASKS.
The hierarchy is strictly: EPIC > STORY > TASK (exactly 3 levels, no more, no less).

Map your technical epics to the user story epics where possible, but focus on backend implementation:
- Transform user stories into technical implementation stories
User stories and epics:
${userStoryList}

IMPORTANT - Structure Guidelines:
Create technical implementation epics and stories that align with the user stories above.
Each EPIC contains multiple STORIES. Each STORY contains multiple TASKS.
The hierarchy is strictly: EPIC > STORY > TASK (exactly 3 levels, no more, no less).

Map your technical epics to the user story epics where possible, but focus on backend implementation:
- Transform user stories into technical implementation stories
- Break down each user story into the backend technical tasks needed to support it
- Group related technical work into epics

Example structure:
Epic 1: "User Management Backend"
  Story 1.1: "User Authentication API"
    Task 1.1.1: "Create user registration endpoint"
    Task 1.1.2: "Implement JWT middleware"
  Story 1.2: "User Profile API"
    Task 1.2.1: "Create profile update endpoint"

Requirements for each task:
- goal: Technical objective (e.g., "Implement authentication middleware with JWT validation")
- deliverable: Concrete output (e.g., "auth.middleware.ts with unit tests", "users migration file")
- deps: List of task names this depends on (e.g., ["Database setup", "User model creation"])
- estimate: XS=1-2h, S=2-4h, M=1d, L=2-3d, XL=1week

Focus areas:
- Database schema design and migrations that support the user stories
- API endpoint implementation (routes, controllers, middleware) for each user story
- Business logic and service layer to fulfill acceptance criteria
- Data validation and error handling
- Security implementation (authentication, authorization, input sanitization)
- Integration with external services/APIs mentioned in user stories
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

    const userStoryListText = state.userStoryList
      ? JSON.stringify(state.userStoryList, null, 2)
      : "No user stories available";

    const plan = await this.askStructured(
      this.buildPrompt(state.architectureDesign ?? "", userStoryListText),
      PlanZ,
      { temperature: 0.3, maxTokens: 4000 }
    );

    const tasks = plan.epics.flatMap((e) =>
      e.stories.flatMap((s) => s.tasks.map((t) => t.name))
    );

    this.log(`produced ${tasks.length} tasks`, threadId);

    return {
      backendTasks: tasks,
      backendPlan: plan,
      messages: this.aiNote("Backend task plan ready."),
    };
  }
}
