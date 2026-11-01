import { Card } from "../../components/ui/Card";
import { EmptyMessage } from "../../components/ui/EmptyMessage";
import { ListRow } from "../../components/ui/ListRow";
import { SectionHeading } from "../../components/ui/SectionHeading";
import { ACTIVITY_PREVIEW_COUNT } from "../../lib/activityText";
import { formatRelativeTime } from "../../lib/relativeTime";
import type { ActivityEntry } from "../../types/activity";
import { ViewAllLink } from "../activity/ViewAllLink";

interface WorkspaceActivitySectionProps {
  // Up to one entry more than the section shows; the extra one only tells it that there is more.
  entries: ActivityEntry[];
  viewAllTo: string;
}

export function WorkspaceActivitySection({ entries, viewAllTo }: WorkspaceActivitySectionProps) {
  const shown = entries.slice(0, ACTIVITY_PREVIEW_COUNT);
  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-4">
        <SectionHeading>Workspace Activity</SectionHeading>
        {entries.length > ACTIVITY_PREVIEW_COUNT && <ViewAllLink to={viewAllTo} />}
      </div>
      <Card>
        {entries.length === 0 ? (
          <EmptyMessage>No activity yet.</EmptyMessage>
        ) : (
          <div className="flex flex-col gap-3">
            {shown.map((entry) => (
              <ListRow
                key={entry.id}
                tinted={false}
                title={`${entry.actorName} ${entry.action}${entry.projectName ? ` in ${entry.projectName}` : ""}`}
                trailing={<span className="text-caption text-ink-muted">{formatRelativeTime(entry.occurredAt)}</span>}
              />
            ))}
          </div>
        )}
      </Card>
    </section>
  );
}
