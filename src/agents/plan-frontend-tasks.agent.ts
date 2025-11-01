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

Requirements:
- Break down into EPIC -> STORIES -> TASKS (max 3 levels) focusing on frontend implementation
- Each task must be concrete and technical (components, state management, routing, API integration, etc.)
- For each task specify:
  * goal: Technical objective (e.g., "Implement authentication flow with JWT token management")
  * deliverable: Concrete output (e.g., "LoginForm.tsx component with unit tests", "auth API client module")
  * deps: Technical dependencies (e.g., API endpoints ready, design system components)
  * estimate: Implementation time (XS=1-2h, S=2-4h, M=1d, L=2-3d, XL=1week)

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
      frontendTasks: tasks,
      messages: this.aiNote("task plan ready."),
    };
  }
}
