import { Badge, type BadgeTone } from "../../components/ui/Badge";
import { kindLabel } from "../../services/documentService";
import type { DocumentKind } from "../../types/document";

const TONES: Record<DocumentKind, BadgeTone> = {
  notes: "neutral",
  requirements: "accent",
  meeting: "info",
  api: "success",
  design: "warning",
};

// The type of a document as a colored badge. Owns the mapping from a type to a color.
export function KindBadge({ kind }: { kind: DocumentKind }) {
  return <Badge tone={TONES[kind]}>{kindLabel(kind)}</Badge>;
}
