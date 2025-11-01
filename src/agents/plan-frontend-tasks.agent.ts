import { RunnableConfig } from "@langchain/core/runnables";
import { BaseAgent } from "../core/base.agent";
import { AppState, StateDiff } from "../core/types";
import { PlanZ } from "../schemas/plan.schema";

export class PlanFrontendTasksAgent extends BaseAgent {
  name() {
    return "planFrontendTasks";
  }

  private buildPrompt(architecture: string) {
    return `You are a senior frontend engineer creating a detailed implementation plan.
Architecture and technical requirements:
${architecture}

IMPORTANT - Structure Guidelines:
Create 2-4 EPICs maximum. Each EPIC contains multiple STORIES. Each STORY contains multiple TASKS.
The hierarchy is strictly: EPIC > STORY > TASK (exactly 3 levels, no more, no less).

Example structure:
Epic 1: "User Interface Setup"
  Story 1.1: "Authentication UI"
    Task 1.1.1: "Create LoginForm component"
    Task 1.1.2: "Implement auth state management"
  Story 1.2: "Dashboard Layout"
    Task 1.2.1: "Create main dashboard component"

Requirements for each task:
- goal: Technical objective (e.g., "Implement authentication flow with JWT token management")
- deliverable: Concrete output (e.g., "LoginForm.tsx component with unit tests", "auth API client module")
- deps: List of task names this depends on (e.g., ["API client setup", "Auth store created"])
- estimate: XS=1-2h, S=2-4h, M=1d, L=2-3d, XL=1week

Focus areas:
- Component architecture (atomic design, composition patterns)
- State management setup (Redux, Zustand, Context, etc.)
- Routing and navigation structure
- API client implementation and data fetching (REST/GraphQL client)
- Form handling and validation
- Authentication/authorization UI flow
- Error handling and loading states
- Responsive design and cross-browser compatibility
- Performance optimization (code splitting, lazy loading, memoization)
- Accessibility (WCAG compliance, ARIA attributes, keyboard navigation)
- Testing (unit tests, integration tests, e2e tests)
- Build configuration and optimization

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
      frontendTasks: tasks,
      messages: this.aiNote("Frontend task plan ready."),
    };
  }
}
