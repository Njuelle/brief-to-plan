import { AppState } from "../core/types";
import { Plan } from "../schemas/plan.schema";
import { UserStories } from "../schemas/user-story.schema";

export class MarkdownFormatter {
  private formatUserStories(userStories: UserStories): string {
    const sections: string[] = [];

    sections.push("## 📖 User Stories");
    sections.push("");

    if (userStories.projectGoals && userStories.projectGoals.length > 0) {
      sections.push("### 🎯 Project Goals");
      userStories.projectGoals.forEach((goal, index) => {
        sections.push(`- ${goal}`);
      });
      sections.push("");
    }

    // Iterate through epics
    userStories.epics.forEach((epic, epicIndex) => {
      sections.push(`### ${epicIndex + 1}. ${epic.name}`);
      sections.push(`> ${epic.description}`);
      sections.push("");

      // Iterate through user stories as a table
      sections.push("| Story | Priority | Acceptance Criteria |");
      sections.push("|-------|----------|---------------------|");

      epic.userStories.forEach((story) => {
        const criteria = story.acceptanceCriteria.map(c => `• ${c}`).join("<br>");
        const priorityEmoji = story.priority === "critical" ? "🔴" :
                              story.priority === "high" ? "🟠" :
                              story.priority === "medium" ? "🟡" : "🟢";
        sections.push(`| ${story.description} | ${priorityEmoji} ${story.priority} | ${criteria} |`);
      });
      sections.push("");
    });

    return sections.join("\n");
  }

  private formatPlan(plan: Plan, title: string): string {
    const sections: string[] = [];
    const emoji = title.includes("Backend") ? "⚙️" : "🎨";

    sections.push(`## ${emoji} ${title}`);
    sections.push("");

    // Iterate through epics
    plan.epics.forEach((epic, epicIndex) => {
      sections.push(`### ${epicIndex + 1}. ${epic.name}`);
      sections.push("");

      // Iterate through stories
      epic.stories.forEach((story, storyIndex) => {
        sections.push(`#### ${epicIndex + 1}.${storyIndex + 1} ${story.name}`);
        sections.push("");

        // Tasks as a table
        sections.push("| Task | Goal | Deliverable | Est | Dependencies |");
        sections.push("|------|------|-------------|-----|--------------|");

        story.tasks.forEach((task) => {
          const deps = task.deps && task.deps.length > 0 ? task.deps.join(", ") : "—";
          sections.push(`| ${task.name} | ${task.goal} | ${task.deliverable} | **${task.estimate}** | ${deps} |`);
        });
        sections.push("");
      });
    });

    // Critical Path & Risks in columns
    const hasCriticalPath = plan.criticalPath && plan.criticalPath.length > 0;
    const hasRisks = plan.risks && plan.risks.length > 0;

    if (hasCriticalPath || hasRisks) {
      sections.push("### 🎯 Critical Path & ⚠️ Risks");
      sections.push("");
      sections.push("| Critical Path | Technical Risks |");
      sections.push("|---------------|-----------------|");

      const maxRows = Math.max(
        hasCriticalPath ? plan.criticalPath.length : 0,
        hasRisks ? plan.risks.length : 0
      );

      for (let i = 0; i < maxRows; i++) {
        const pathItem = hasCriticalPath && i < plan.criticalPath.length ? plan.criticalPath[i] : "";
        const riskItem = hasRisks && i < plan.risks.length ? plan.risks[i] : "";
        sections.push(`| ${pathItem} | ${riskItem} |`);
      }
      sections.push("");
    }

    return sections.join("\n");
  }

  format(state: AppState): string {
    const sections: string[] = [];

    // Header with Summary
    const totalTasks = (state.backendTasks?.length || 0) + (state.frontendTasks?.length || 0);
    const userStoryCount = state.userStoryList?.epics.reduce((sum: number, e: any) => sum + e.userStories.length, 0) || 0;
    const backendEpics = state.backendPlan?.epics.length || 0;
    const frontendEpics = state.frontendPlan?.epics.length || 0;

    sections.push("# 📋 Technical Implementation Plan");
    sections.push("");
    sections.push(`> **Generated:** ${new Date().toLocaleString()}`);
    sections.push(`> **User Stories:** ${userStoryCount} | **Epics:** ${backendEpics + frontendEpics} | **Tasks:** ${totalTasks}`);
    sections.push("");
    sections.push("---");
    sections.push("");

    // Original Brief
    if (state.brief) {
      sections.push("## 💡 Brief");
      sections.push("");
      sections.push(`> ${state.brief}`);
      sections.push("");
    }

    // Extended Brief
    if (state.expandedBrief) {
      sections.push("<details>");
      sections.push("<summary><strong>📝 Extended Brief (click to expand)</strong></summary>");
      sections.push("");
      sections.push(state.expandedBrief);
      sections.push("");
      sections.push("</details>");
      sections.push("");
    }

    // User Stories
    if (state.userStoryList) {
      sections.push(this.formatUserStories(state.userStoryList));
      sections.push("");
    }

    // Architecture
    if (state.architectureDesign) {
      sections.push("## 🏗️ System Architecture");
      sections.push("");
      sections.push(state.architectureDesign);
      sections.push("");
    }

    // Backend Plan
    if (state.backendPlan) {
      sections.push(this.formatPlan(state.backendPlan, "Backend Implementation"));
      sections.push("");
    }

    // Frontend Plan
    if (state.frontendPlan) {
      sections.push(this.formatPlan(state.frontendPlan, "Frontend Implementation"));
      sections.push("");
    }

    return sections.join("\n");
  }

  formatCompact(state: AppState): string {
    const lines: string[] = [];

    lines.push("╔═══════════════════════════════════════════════════════════════╗");
    lines.push("║          TECHNICAL IMPLEMENTATION PLAN                        ║");
    lines.push("╚═══════════════════════════════════════════════════════════════╝");
    lines.push("");

    if (state.brief) {
      lines.push("📋 ORIGINAL BRIEF");
      lines.push("─".repeat(65));
      lines.push(state.brief);
      lines.push("");
    }

    const totalTasks =
      (state.backendTasks?.length || 0) + (state.frontendTasks?.length || 0);

    const userStoryEpics = state.userStoryList?.epics.length || 0;
    const userStoryCount = state.userStoryList?.epics.reduce(
      (sum: number, e: any) => sum + e.userStories.length,
      0
    ) || 0;

    const backendEpics = state.backendPlan?.epics.length || 0;
    const frontendEpics = state.frontendPlan?.epics.length || 0;
    const totalEpics = backendEpics + frontendEpics;

    lines.push("📊 SUMMARY");
    lines.push("─".repeat(65));
    lines.push(`✓ User Story Epics:   ${userStoryEpics}`);
    lines.push(`✓ User Stories:       ${userStoryCount}`);
    lines.push(`✓ Implementation Epics: ${totalEpics} (Backend: ${backendEpics}, Frontend: ${frontendEpics})`);
    lines.push(`✓ Backend Tasks:      ${state.backendTasks?.length || 0}`);
    lines.push(`✓ Frontend Tasks:     ${state.frontendTasks?.length || 0}`);
    lines.push(`✓ Total Tasks:        ${totalTasks}`);
    lines.push("");

    return lines.join("\n");
  }
}
