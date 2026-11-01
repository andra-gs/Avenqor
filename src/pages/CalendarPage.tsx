import { useState } from "react";
import { Button } from "../components/ui/Button";
import { EmptyMessage } from "../components/ui/EmptyMessage";
import { IconButton } from "../components/ui/IconButton";
import { PlaceholderNotice } from "../components/ui/PlaceholderNotice";
import { DeadlineList } from "../features/calendar/DeadlineList";
import { MonthGrid } from "../features/calendar/MonthGrid";
import { useCalendarData } from "../hooks/useCalendarData";
import { addMonths, buildMonthGrid, formatMonthTitle } from "../lib/calendar";
import { todayDateText } from "../lib/dueDate";
import { getOpenDeadlines, groupByDate } from "../services/calendarService";

export function CalendarPage() {
  const { state } = useCalendarData();
  const [shown, setShown] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  });

  if (!state || state.kind === "loading") return <EmptyMessage>Loading calendar…</EmptyMessage>;
  if (state.kind === "error") return <PlaceholderNotice message={state.message} />;
  if (state.kind === "notFound") return <PlaceholderNotice message="The calendar could not be loaded." />;

  const tasks = state.data;
  const today = todayDateText();

  function goToToday() {
    const now = new Date();
    setShown({ year: now.getFullYear(), month: now.getMonth() });
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-title font-bold">{formatMonthTitle(shown.year, shown.month)}</h2>
        <div className="flex items-center gap-2">
          <IconButton
            icon="arrowLeft"
            label="Previous month"
            onClick={() => setShown(addMonths(shown.year, shown.month, -1))}
          />
          <IconButton
            icon="arrowRight"
            label="Next month"
            onClick={() => setShown(addMonths(shown.year, shown.month, 1))}
          />
          <Button variant="secondary" onClick={goToToday}>
            Today
          </Button>
        </div>
      </div>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <MonthGrid
          weeks={buildMonthGrid(shown.year, shown.month)}
          tasksByDate={groupByDate(tasks)}
          today={today}
        />
        <DeadlineList tasks={getOpenDeadlines(tasks)} />
      </div>
    </div>
  );
}
