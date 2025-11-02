import { RunnableConfig } from "@langchain/core/runnables";
import { BaseAgent } from "../core/base.agent";
import { AppState, StateDiff } from "../core/types";
import { UserStoriesZ } from "../schemas/user-story.schema";

export class UserStoriesAgent extends BaseAgent {
  name() {
    return "userStories";
  }

  async run(state: AppState, config?: RunnableConfig): Promise<StateDiff> {
    const threadId = config?.configurable?.thread_id as string | undefined;
    this.log("start", threadId);

    const prompt = `You are a product owner defining user stories for a software project.
Extended brief:
"${state.expandedBrief}"

Objective:
Define comprehensive epics and user stories for this project. Focus on the USER perspective and business value.

Guidelines:
- Create 3-8 epics that group related functionality
- Each epic should contain 2-8 user stories
- User stories should follow the format: "As a [user type], I want [goal] so that [benefit]"
- Each user story must have clear acceptance criteria
- Prioritize user stories (critical, high, medium, low) based on business value and dependencies
- Consider different user types (end users, admins, system actors, external integrations)
- Include stories for non-functional requirements (security, performance, accessibility)

Focus areas:
- Core user workflows and journeys
- User authentication and authorization flows
- Data management (create, read, update, delete operations)
- User interface interactions and feedback
- Error handling and edge cases from user perspective
- Integration touchpoints with external systems
- Administrative and configuration capabilities
- Reporting and analytics needs
- Security and privacy requirements
- Performance and usability requirements

Remember: Focus on WHAT the user needs and WHY, not HOW it will be implemented technically.`;

    const userStories = await this.askStructured(prompt, UserStoriesZ, {
      temperature: 0.4,
      maxTokens: 4000,
    });

    const storyCount = userStories.epics.reduce(
      (sum, epic) => sum + epic.userStories.length,
      0
    );

    this.log(
      `produced ${userStories.epics.length} epics with ${storyCount} user stories`,
      threadId
    );

    return {
      userStoryList: userStories,
      messages: this.aiNote("User stories defined."),
    };
  }
}
