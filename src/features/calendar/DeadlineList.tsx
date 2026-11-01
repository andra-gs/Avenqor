import { Link } from "react-router";
import { taskPath } from "../../app/navigation";
import { Badge } from "../../components/ui/Badge";
import { Card } from "../../components/ui/Card";
import { EmptyMessage } from "../../components/ui/EmptyMessage";
import { ListRow } from "../../components/ui/ListRow";
import { SectionHeading } from "../../components/ui/SectionHeading";
import { getDueInfo } from "../../lib/dueDate";
import type { DeadlineTask } from "../../types/calendar";

const MAX_ROWS = 10;

// The unfinished tasks with a deadline, soonest first, so overdue ones are at the top.
export function DeadlineList({ tasks }: { tasks: DeadlineTask[] }) {
  const shown = tasks.slice(0, MAX_ROWS);
  return (
    <section className="flex flex-col gap-3">
      <SectionHeading>Upcoming deadlines</SectionHeading>
      <Card>
        {tasks.length === 0 ? (
          <EmptyMessage>No open tasks with a deadline.</EmptyMessage>
        ) : (
          <div className="flex flex-col gap-2">
            {shown.map((task) => {
              const due = getDueInfo(task.dueDate);
              return (
                <Link
                  key={task.id}
                  to={taskPath(task.id)}
                  className="block rounded-control outline-offset-2 hover:opacity-80 focus-visible:outline-2 focus-visible:outline-accent"
                >
                  <ListRow
                    title={task.title}
                    subtitle={task.projectName}
                    trailing={<Badge tone={due.tone}>{due.label}</Badge>}
                  />
                </Link>
              );
            })}
            {tasks.length > MAX_ROWS && (
              <p className="text-caption text-ink-muted">and {tasks.length - MAX_ROWS} more</p>
            )}
          </div>
        )}
      </Card>
    </section>
  );
}
