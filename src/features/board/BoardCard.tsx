import { useState } from "react";
import { Link } from "react-router";
import { taskPath } from "../../app/navigation";
import { Badge } from "../../components/ui/Badge";
import { IconButton } from "../../components/ui/IconButton";
import { PriorityBadge } from "../../components/ui/PriorityBadge";
import { LabelBadges } from "../labels/LabelBadges";
import { cx } from "../../lib/classNames";
import { getDueInfo } from "../../lib/dueDate";
import { TASK_DRAG_TYPE } from "./dragData";
import { TASK_STATUSES, type TaskItem, type TaskStatus } from "../../types/task";

interface BoardCardProps {
  task: TaskItem;
  disabled: boolean;
  onMove: (taskId: string, status: TaskStatus) => void;
}

// One task on the board: title, priority, deadline, and two buttons that move it one column left or right.
// The card can also be dragged to another column with the mouse; the buttons stay for the keyboard.
export function BoardCard({ task, disabled, onMove }: BoardCardProps) {
  const index = TASK_STATUSES.indexOf(task.status);
  const previous = index > 0 ? TASK_STATUSES[index - 1] : undefined;
  const next = index < TASK_STATUSES.length - 1 ? TASK_STATUSES[index + 1] : undefined;
  const due = task.dueDate && task.status !== "done" ? getDueInfo(task.dueDate) : undefined;

  const [dragging, setDragging] = useState(false);

  return (
    <div
      draggable={!disabled}
      onDragStart={(event) => {
        event.dataTransfer.setData(TASK_DRAG_TYPE, task.id);
        event.dataTransfer.effectAllowed = "move";
        setDragging(true);
      }}
      onDragEnd={() => setDragging(false)}
      className={cx(
        "flex flex-col gap-2 rounded-control border border-border bg-surface p-3",
        !disabled && "cursor-grab",
        dragging && "opacity-50",
      )}
    >
      <Link
        to={taskPath(task.id)}
        // A link is draggable by itself; turn that off so dragging from the title moves the card.
        draggable={false}
        className="rounded-control text-small font-semibold break-words outline-offset-2 hover:text-accent focus-visible:outline-2 focus-visible:outline-accent"
      >
        {task.title}
      </Link>
      <div className="flex flex-wrap items-center gap-2">
        <PriorityBadge priority={task.priority} />
        {due && <Badge tone={due.tone}>{due.label}</Badge>}
        <LabelBadges labels={task.labels} />
      </div>
      <div className="flex justify-end gap-1">
        <IconButton
          icon="arrowLeft"
          label="Move to the previous column"
          disabled={disabled || !previous}
          onClick={() => previous && onMove(task.id, previous)}
        />
        <IconButton
          icon="arrowRight"
          label="Move to the next column"
          disabled={disabled || !next}
          onClick={() => next && onMove(task.id, next)}
        />
      </div>
    </div>
  );
}
