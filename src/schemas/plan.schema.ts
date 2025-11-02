import { z } from "zod";

// Technical Implementation Task Schema
export const TaskZ = z.object({
  name: z.string().min(1).describe("Task name"),
  goal: z.string().min(1).describe("Technical objective of the task"),
  deliverable: z.string().min(1).describe("Concrete output or artifact"),
  deps: z.array(z.string()).default([]).describe("List of dependency task names"),
  estimate: z.enum(["XS", "S", "M", "L", "XL"]).describe("Time estimate"),
});

// Technical Implementation Story Schema (contains multiple tasks)
export const ImplementationStoryZ = z.object({
  name: z.string().min(1).describe("Technical story name"),
  tasks: z.array(TaskZ).min(1).describe("List of tasks for this story (must have at least 1 task)"),
});

// Technical Implementation Epic Schema (contains multiple implementation stories)
export const ImplementationEpicZ = z.object({
  name: z.string().min(1).describe("Epic name"),
  stories: z.array(ImplementationStoryZ).min(1).describe("List of stories in this epic (must have at least 1 story)"),
});

// Technical Implementation Plan Schema
export const PlanZ = z.object({
  epics: z.array(ImplementationEpicZ).min(1).max(5).describe("List of 1-5 epics in the project plan"),
  criticalPath: z.array(z.string()).default([]).describe("Task names on critical path"),
  risks: z.array(z.string()).default([]).describe("Identified technical risks"),
});

export type Plan = z.infer<typeof PlanZ>;
