import { Badge } from "../../components/ui/Badge";
import type { Label } from "../../types/label";

// The labels of a task as small colored badges. Shows nothing when there are none.
export function LabelBadges({ labels }: { labels: Label[] }) {
  if (labels.length === 0) return null;
  return (
    <>
      {labels.map((label) => (
        <Badge key={label.id} tone={label.color}>
          {label.name}
        </Badge>
      ))}
    </>
  );
}
