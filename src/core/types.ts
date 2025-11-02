import { BaseMessage } from "@langchain/core/messages";
import { Plan } from "../schemas/plan.schema";
import { UserStories } from "../schemas/user-story.schema";

export type AppState = {
  messages?: BaseMessage[];
  brief: string;
  expandedBrief?: string;
  userStoryList?: UserStories;
  architectureDesign?: string;
  backendTasks?: string[];
  frontendTasks?: string[];
  backendPlan?: Plan;
  frontendPlan?: Plan;
  reformulated?: string;
};

export type StateDiff = Partial<AppState>;
