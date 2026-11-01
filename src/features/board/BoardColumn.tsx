import { useState } from "react";
import { Badge } from "../../components/ui/Badge";
import { EmptyMessage } from "../../components/ui/EmptyMessage";
import type { TaskItem, TaskStatus } from "../../types/task";
import { cx } from "../../lib/classNames";
import { BoardCard } from "./BoardCard";
import { TASK_DRAG_TYPE } from "./dragData";

interface BoardColumnProps {
  title: string;
  // The status a card gets when it is dropped on this column.
  status: TaskStatus;
  tasks: TaskItem[];
  disabled: boolean;
  onMove: (taskId: string, status: TaskStatus) => void;
}

// One status column: its name, how many tasks it holds, and the task cards.
export function BoardColumn({ title, status, tasks, disabled, onMove }: BoardColumnProps) {
  // How many drag enters are not yet matched by a leave: the pointer crossing a child fires both events.
  const [overDepth, setOverDepth] = useState(0);
  const isTaskDrag = (types: readonly string[]) => types.includes(TASK_DRAG_TYPE);

  return (
    <section
      aria-label={title}
      onDragEnter={(event) => {
        if (disabled || !isTaskDrag(event.dataTransfer.types)) return;
        event.preventDefault();
        setOverDepth((depth) => depth + 1);
      }}
      onDragOver={(event) => {
        if (disabled || !isTaskDrag(event.dataTransfer.types)) return;
        event.preventDefault();
        event.dataTransfer.dropEffect = "move";
      }}
      onDragLeave={(event) => {
        if (!isTaskDrag(event.dataTransfer.types)) return;
        setOverDepth((depth) => Math.max(0, depth - 1));
      }}
      onDrop={(event) => {
        setOverDepth(0);
        if (disabled || !isTaskDrag(event.dataTransfer.types)) return;
        event.preventDefault();
        const taskId = event.dataTransfer.getData(TASK_DRAG_TYPE);
        // Dropping a card on the column it already is in changes nothing.
        if (taskId && !tasks.some((task) => task.id === taskId)) onMove(taskId, status);
      }}
      className={cx("flex flex-col gap-3 rounded-card p-3", overDepth > 0 ? "bg-accent-soft" : "bg-surface-muted")}
    >
      <div className="flex items-center justify-between gap-2 px-1">
        <h3 className="text-caption font-bold tracking-wide text-ink-muted uppercase">{title}</h3>
        <Badge>{tasks.length}</Badge>
      </div>
      {tasks.length === 0 ? (
        <EmptyMessage>No tasks</EmptyMessage>
      ) : (
        tasks.map((task) => <BoardCard key={task.id} task={task} disabled={disabled} onMove={onMove} />)
      )}
    </section>
  );
}
