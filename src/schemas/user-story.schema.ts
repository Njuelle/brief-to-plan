import { z } from "zod";

export const UserStoryZ = z.object({
  name: z.string().min(1).describe("User story name"),
  description: z
    .string()
    .min(1)
    .describe(
      "User story description in format: As a [user type], I want [goal] so that [benefit]"
    ),
  acceptanceCriteria: z
    .array(z.string())
    .min(1)
    .describe("List of acceptance criteria for this user story"),
  priority: z
    .enum(["critical", "high", "medium", "low"])
    .describe("Priority level of this user story"),
});

export const EpicStoryZ = z.object({
  name: z.string().min(1).describe("Epic name"),
  description: z
    .string()
    .min(1)
    .describe("Brief description of what this epic encompasses"),
  userStories: z
    .array(UserStoryZ)
    .min(1)
    .describe("List of user stories in this epic (must have at least 1)"),
});

export const UserStoriesZ = z.object({
  epics: z
    .array(EpicStoryZ)
    .min(1)
    .max(8)
    .describe("List of 1-8 epics containing all user stories for the project"),
  projectGoals: z
    .array(z.string())
    .default([])
    .describe("High-level project goals and objectives"),
});

export type UserStories = z.infer<typeof UserStoriesZ>;
export type EpicStory = z.infer<typeof EpicStoryZ>;
export type UserStory = z.infer<typeof UserStoryZ>;
