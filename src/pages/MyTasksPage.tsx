import { useState } from "react";
import { Button } from "../components/ui/Button";
import { EmptyMessage } from "../components/ui/EmptyMessage";
import { PlaceholderNotice } from "../components/ui/PlaceholderNotice";
import { MyTaskList } from "../features/my-tasks/MyTaskList";
import { useMyTasks } from "../hooks/useMyTasks";
import { filterMyTasks, type MyTaskFilter } from "../services/myTasksService";

const FILTERS: { value: MyTaskFilter; label: string; empty: string }[] = [
  { value: "open", label: "Open", empty: "No open tasks. Nothing is waiting for you." },
  { value: "todo", label: "To Do", empty: "No tasks in To Do." },
  { value: "in_progress", label: "In Progress", empty: "No tasks in progress." },
  { value: "review", label: "Review", empty: "No tasks in review." },
  { value: "done", label: "Done", empty: "No finished tasks yet." },
  { value: "all", label: "All", empty: "No tasks are assigned to you yet." },
];

export function MyTasksPage() {
  const { state } = useMyTasks();
  const [filter, setFilter] = useState<MyTaskFilter>("open");

  if (!state || state.kind === "loading") return <EmptyMessage>Loading tasks…</EmptyMessage>;
  if (state.kind === "error") return <PlaceholderNotice message={state.message} />;
  if (state.kind === "notFound") return <PlaceholderNotice message="Your tasks could not be loaded." />;

  const current = FILTERS.find((item) => item.value === filter) ?? FILTERS[0];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-2" role="group" aria-label="Filter tasks by status">
        {FILTERS.map((item) => (
          <Button
            key={item.value}
            variant={item.value === filter ? "primary" : "secondary"}
            aria-pressed={item.value === filter}
            onClick={() => setFilter(item.value)}
          >
            {item.label}
          </Button>
        ))}
      </div>
      <MyTaskList tasks={filterMyTasks(state.data, filter)} emptyMessage={current.empty} />
    </div>
  );
}
