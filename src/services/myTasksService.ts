import * as repository from "../repositories/myTasksRepository";
import type { MyTask } from "../types/myTasks";
import type { TaskStatus } from "../types/task";
import { getLocalProfileId } from "./profileService";

// "open" means every status except done; "all" means every task.
export type MyTaskFilter = "open" | "all" | TaskStatus;

export async function getMyTasks(): Promise<MyTask[]> {
  return repository.listTasksAssignedTo(await getLocalProfileId());
}

export function filterMyTasks(tasks: MyTask[], filter: MyTaskFilter): MyTask[] {
  if (filter === "all") return tasks;
  if (filter === "open") return tasks.filter((task) => task.status !== "done");
  return tasks.filter((task) => task.status === filter);
}
