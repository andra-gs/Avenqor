import { Link } from "react-router";
import { documentPath } from "../../app/navigation";
import { EmptyMessage } from "../../components/ui/EmptyMessage";
import { cx } from "../../lib/classNames";
import { formatDateTime } from "../../lib/dateFormat";
import { kindCode } from "../../services/documentService";
import type { DocumentSummary } from "../../types/document";

interface DocumentListProps {
  documents: DocumentSummary[];
  selectedId?: string;
  emptyMessage: string;
  // Show the name of the project under each title (not needed on a project page).
  showProject?: boolean;
}

// The documents as rows: a small square with the type code, the title, and when it was last changed.
export function DocumentList({ documents, selectedId, emptyMessage, showProject = true }: DocumentListProps) {
  if (documents.length === 0) return <EmptyMessage>{emptyMessage}</EmptyMessage>;
  return (
    <ul className="flex flex-col gap-1">
      {documents.map((document) => (
        <li key={document.id}>
          <Link
            // Clicking the open document again closes it (back to the list alone).
            to={document.id === selectedId ? "/documents" : documentPath(document.id)}
            aria-current={document.id === selectedId ? "page" : undefined}
            className={cx(
              "flex items-center gap-3 rounded-control px-3 py-2.5 outline-offset-2 focus-visible:outline-2 focus-visible:outline-accent",
              document.id === selectedId ? "bg-accent-soft" : "hover:bg-surface-muted",
            )}
          >
            <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-control bg-track text-caption font-bold text-ink-muted">
              {kindCode(document.kind)}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-small font-semibold">{document.title}</span>
              <span className="block truncate text-caption text-ink-muted">
                {showProject ? `${document.projectName} · ` : ""}
                {formatDateTime(document.updatedAt)}
              </span>
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
