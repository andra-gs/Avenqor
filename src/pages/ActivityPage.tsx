import { useParams } from "react-router";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { EmptyMessage } from "../components/ui/EmptyMessage";
import { ListRow } from "../components/ui/ListRow";
import { PlaceholderNotice } from "../components/ui/PlaceholderNotice";
import { useActivityLog } from "../hooks/useActivityLog";
import { formatRelativeTime } from "../lib/relativeTime";
import type { ActivityScope } from "../types/activity";

// The full activity list. One page serves three addresses: everything, one workspace, one project.
export function ActivityPage() {
  const { workspaceId, projectId } = useParams();
  const scope: ActivityScope = workspaceId
    ? { kind: "workspace", id: workspaceId }
    : projectId
      ? { kind: "project", id: projectId }
      : { kind: "all" };
  const { entries, hasMore, error, showMore } = useActivityLog(scope);

  if (error) return <PlaceholderNotice message={error} />;
  if (!entries) return <EmptyMessage>Loading activity…</EmptyMessage>;

  return (
    <div className="flex flex-col gap-4">
      <Card>
        {entries.length === 0 ? (
          <EmptyMessage>No activity yet.</EmptyMessage>
        ) : (
          <div className="flex flex-col gap-3">
            {entries.map((entry) => (
              <ListRow
                key={entry.id}
                tinted={false}
                title={`${entry.actorName} ${entry.action}${entry.projectName && scope.kind !== "project" ? ` in ${entry.projectName}` : ""}`}
                trailing={<span className="text-caption text-ink-muted">{formatRelativeTime(entry.occurredAt)}</span>}
              />
            ))}
          </div>
        )}
      </Card>
      {hasMore && (
        <div>
          <Button variant="secondary" onClick={showMore}>
            Show 50 more
          </Button>
        </div>
      )}
    </div>
  );
}
