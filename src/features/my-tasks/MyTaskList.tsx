import { Link } from "react-router";
import { taskPath } from "../../app/navigation";
import { Badge } from "../../components/ui/Badge";
import { Card } from "../../components/ui/Card";
import { EmptyMessage } from "../../components/ui/EmptyMessage";
import { ListRow } from "../../components/ui/ListRow";
import { PriorityBadge } from "../../components/ui/PriorityBadge";
import { StatusBadge } from "../../components/ui/StatusBadge";
import { getDueInfo } from "../../lib/dueDate";
import type { MyTask } from "../../types/myTasks";

interface MyTaskListProps {
  tasks: MyTask[];
  emptyMessage: string;
}

// Rows of tasks. Each row opens the task.
export function MyTaskList({ tasks, emptyMessage }: MyTaskListProps) {
  return (
    <Card>
      {tasks.length === 0 ? (
        <EmptyMessage>{emptyMessage}</EmptyMessage>
      ) : (
        <div className="flex flex-col gap-2">
          {tasks.map((task) => {
            const due = task.dueDate && task.status !== "done" ? getDueInfo(task.dueDate) : undefined;
            return (
              <Link
                key={task.id}
                to={taskPath(task.id)}
                className="block rounded-control outline-offset-2 hover:opacity-80 focus-visible:outline-2 focus-visible:outline-accent"
              >
                <ListRow
                  title={task.title}
                  subtitle={task.projectName}
                  trailing={
                    <div className="flex items-center gap-2">
                      {due && <Badge tone={due.tone}>{due.label}</Badge>}
                      <PriorityBadge priority={task.priority} />
                      <StatusBadge status={task.status} />
                    </div>
                  }
                />
              </Link>
            );
          })}
        </div>
      )}
    </Card>
  );
}
