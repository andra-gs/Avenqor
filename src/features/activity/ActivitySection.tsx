import { Avatar } from "../../components/ui/Avatar";
import { Card } from "../../components/ui/Card";
import { EmptyMessage } from "../../components/ui/EmptyMessage";
import { ListRow } from "../../components/ui/ListRow";
import { SectionHeading } from "../../components/ui/SectionHeading";
import { ACTIVITY_PREVIEW_COUNT } from "../../lib/activityText";
import { formatRelativeTime } from "../../lib/relativeTime";
import { getInitials } from "../../lib/text";
import type { ActivityEntry } from "../../types/activity";
import { ViewAllLink } from "./ViewAllLink";

const AVATAR_TONES = ["accent", "info", "success"] as const;

interface ActivitySectionProps {
  // Up to one entry more than the section shows; the extra one only tells it that there is more.
  entries: ActivityEntry[];
  // The address of the full list.
  viewAllTo: string;
}

// The newest few entries, with a link to the full list when there are more.
export function ActivitySection({ entries, viewAllTo }: ActivitySectionProps) {
  const shown = entries.slice(0, ACTIVITY_PREVIEW_COUNT);
  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-4">
        <SectionHeading>Activity</SectionHeading>
        {entries.length > ACTIVITY_PREVIEW_COUNT && <ViewAllLink to={viewAllTo} />}
      </div>
      <Card>
        {entries.length === 0 ? (
          <EmptyMessage>No activity yet.</EmptyMessage>
        ) : (
          <div className="flex flex-col gap-4">
            {shown.map((entry, index) => (
              <ListRow
                key={entry.id}
                tinted={false}
                leading={<Avatar size="sm" tone={AVATAR_TONES[index % AVATAR_TONES.length]} initials={getInitials(entry.actorName)} />}
                title={entry.actorName}
                subtitle={
                  <>
                    <span className="block">{entry.action}</span>
                    <span className="block">{formatRelativeTime(entry.occurredAt)}</span>
                  </>
                }
              />
            ))}
          </div>
        )}
      </Card>
    </section>
  );
}
