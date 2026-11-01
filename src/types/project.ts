import type { ActivityEntry } from "./activity";
import type { ProjectLabel } from "./label";
import type { TaskItem } from "./task";

export type ProjectStatus = "active" | "archived";

// The database model is designed in Phase 2 and may refine these shapes.
export interface ProjectSummary {
  id: string;
  name: string;
  description: string;
  status: ProjectStatus;
  progressPercent: number;
}

export interface ProjectDetail extends ProjectSummary {
  workspaceId: string;
  workspaceName: string;
  taskCount: number;
  completedTaskCount: number;
  tasks: TaskItem[];
  // The labels of the project (the ones its tasks can use), with how many tasks carry each.
  labels: ProjectLabel[];
  activity: ActivityEntry[];
}
