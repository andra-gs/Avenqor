import { calculateProgress } from "../lib/progress";
import * as repository from "../repositories/dashboardRepository";
import { getRecentActivity } from "./activityService";
import type { DashboardData } from "../types/dashboard";
import { getLocalProfileId } from "./profileService";

// Everything the dashboard shows. Progress is calculated from task counts.
// The activity list is the newest entries of the local history (migration 6).
export async function getDashboardData(): Promise<DashboardData> {
  const [rows, activity] = await Promise.all([repository.getDashboardRows(await getLocalProfileId()), getRecentActivity()]);
  return {
    workspaces: rows.workspaces,
    recentProjects: rows.recentProjects.map((project) => ({
      id: project.id,
      name: project.name,
      description: project.description,
      status: project.status,
      progressPercent: calculateProgress(project.completedTaskCount, project.taskCount),
    })),
    myTasks: rows.myTasks,
    activity,
  };
}
