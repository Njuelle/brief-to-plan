import { RunnableConfig } from "@langchain/core/runnables";
import { BaseAgent } from "../core/base.agent";
import { AppState, StateDiff } from "../core/types";
import { PlanZ } from "../schemas/plan.schema";

export class PlanFrontendTasksAgent extends BaseAgent {
  name() {
    return "planFrontendTasks";
  }

  private buildPrompt(architecture: string, userStoryList: string) {
    return `You are a senior frontend engineer creating a detailed implementation plan.

Architecture design:
${architecture}

User stories:
${userStoryList}

IMPORTANT - Structure Guidelines:
Create technical implementation epics and stories that align with the user stories above.
Each EPIC contains multiple STORIES. Each STORY contains multiple TASKS.
The hierarchy is strictly: EPIC > STORY > TASK (exactly 3 levels, no more, no less).

Map your technical epics to the user story epics where possible, but focus on frontend implementation:
- Transform user stories into technical UI/UX implementation stories
User stories and epics:
${userStoryList}

IMPORTANT - Structure Guidelines:
Create technical implementation epics and stories that align with the user stories above.
Each EPIC contains multiple STORIES. Each STORY contains multiple TASKS.
The hierarchy is strictly: EPIC > STORY > TASK (exactly 3 levels, no more, no less).

Map your technical epics to the user story epics where possible, but focus on frontend implementation:
- Transform user stories into technical UI/UX implementation stories
- Break down each user story into the frontend technical tasks needed to support it
- Group related UI/UX work into epics
- Consider the user flows and acceptance criteria when planning components and features

Example structure:
Epic 1: "User Management UI"
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
- Component architecture that fulfills user stories (atomic design, composition patterns)
- State management setup (Redux, Zustand, Context, etc.) for user data and flows
- Routing and navigation structure based on user journeys
- API client implementation and data fetching (REST/GraphQL client)
- Form handling and validation matching acceptance criteria
- Authentication/authorization UI flow from user stories
- Error handling and loading states for better UX
- Responsive design and cross-browser compatibility
- Performance optimization (code splitting, lazy loading, memoization)
- Accessibility (WCAG compliance, ARIA attributes, keyboard navigation) as per acceptance criteria
- Testing (unit tests, integration tests, e2e tests) covering user workflows
- Build configuration and optimization

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
      frontendTasks: tasks,
      frontendPlan: plan,
      messages: this.aiNote("Frontend task plan ready."),
    };
  }
}
