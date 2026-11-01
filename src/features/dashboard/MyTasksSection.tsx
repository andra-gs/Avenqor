import { taskPath } from "../../app/navigation";
import { Badge } from "../../components/ui/Badge";
import { Card } from "../../components/ui/Card";
import { EmptyMessage } from "../../components/ui/EmptyMessage";
import { ListRow } from "../../components/ui/ListRow";
import { SectionHeading } from "../../components/ui/SectionHeading";
import { getDueInfo } from "../../lib/dueDate";
import type { DashboardTask } from "../../types/dashboard";

export function MyTasksSection({ tasks }: { tasks: DashboardTask[] }) {
  return (
    <section className="flex flex-col gap-3">
      <SectionHeading>My Tasks</SectionHeading>
      <Card>
        {tasks.length === 0 ? (
          <EmptyMessage>No tasks are assigned to you.</EmptyMessage>
        ) : (
          <div className="flex flex-col gap-2">
            {tasks.map((task) => {
              const due = task.dueDate ? getDueInfo(task.dueDate) : undefined;
              return (
                <ListRow
                  key={task.id}
                  title={task.title}
                  titleTo={taskPath(task.id)}
                  subtitle={task.projectName}
                  trailing={due ? <Badge tone={due.tone}>{due.label}</Badge> : undefined}
                />
              );
            })}
          </div>
        )}
      </Card>
    </section>
  );
}
