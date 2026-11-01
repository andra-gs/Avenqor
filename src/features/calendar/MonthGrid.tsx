import { Link } from "react-router";
import { taskPath } from "../../app/navigation";
import { WEEKDAY_LABELS, type CalendarDay } from "../../lib/calendar";
import { cx } from "../../lib/classNames";
import { getDaysUntil } from "../../lib/dueDate";
import type { DeadlineTask } from "../../types/calendar";

const MAX_CHIPS_PER_DAY = 2;

interface MonthGridProps {
  weeks: CalendarDay[][];
  tasksByDate: Map<string, DeadlineTask[]>;
  today: string;
}

// Overdue deadlines are red, upcoming ones use the accent color, finished tasks are muted.
function chipStyle(task: DeadlineTask): string {
  if (task.status === "done") return "bg-track text-ink-muted line-through";
  return getDaysUntil(task.dueDate) < 0 ? "bg-danger-soft text-danger" : "bg-accent-soft text-accent";
}

export function MonthGrid({ weeks, tasksByDate, today }: MonthGridProps) {
  return (
    <div className="flex flex-col gap-1">
      <div className="grid grid-cols-7 gap-1">
        {WEEKDAY_LABELS.map((label) => (
          <p key={label} className="px-2 text-caption font-semibold text-ink-muted uppercase">
            {label}
          </p>
        ))}
      </div>
      {weeks.map((week) => (
        <div key={week[0].date} className="grid grid-cols-7 gap-1">
          {week.map((day) => {
            const tasks = tasksByDate.get(day.date) ?? [];
            const hidden = tasks.length - MAX_CHIPS_PER_DAY;
            const isToday = day.date === today;
            return (
              <div
                key={day.date}
                className={cx(
                  "flex min-h-24 min-w-0 flex-col gap-1 rounded-control border p-1.5",
                  isToday ? "border-accent bg-surface" : "border-border",
                  day.inMonth ? "bg-surface" : "bg-surface-muted",
                )}
              >
                <p className={cx("text-caption font-semibold", isToday ? "text-accent" : day.inMonth ? "text-ink" : "text-ink-muted")}>
                  {day.dayOfMonth}
                </p>
                {tasks.slice(0, MAX_CHIPS_PER_DAY).map((task) => (
                  <Link
                    key={task.id}
                    to={taskPath(task.id)}
                    title={`${task.title} · ${task.projectName}`}
                    className={cx(
                      "truncate rounded-control px-1.5 py-0.5 text-caption outline-offset-2 hover:opacity-80 focus-visible:outline-2 focus-visible:outline-accent",
                      chipStyle(task),
                    )}
                  >
                    {task.title}
                  </Link>
                ))}
                {hidden > 0 && <p className="px-1 text-caption text-ink-muted">+{hidden} more</p>}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
