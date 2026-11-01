import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { projectPath } from "../../app/navigation";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { ConfirmDialog } from "../../components/ui/ConfirmDialog";
import { EmptyMessage } from "../../components/ui/EmptyMessage";
import { PlaceholderNotice } from "../../components/ui/PlaceholderNotice";
import { useDocumentActions, useDocumentDetail } from "../../hooks/useDocuments";
import { formatDateTime } from "../../lib/dateFormat";
import { describeError } from "../../lib/errors";
import { DocumentFormDialog } from "./DocumentFormDialog";
import { KindBadge } from "./KindBadge";

const LINK_STYLE =
  "rounded-control text-accent outline-offset-2 hover:underline focus-visible:outline-2 focus-visible:outline-accent";

// The open document: title, type, project, dates, text, and the buttons to edit or delete it.
export function DocumentView({ documentId }: { documentId: string }) {
  const navigate = useNavigate();
  const { state } = useDocumentDetail(documentId);
  const { updateDocument, deleteDocument } = useDocumentActions();
  const [editOpen, setEditOpen] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [actionError, setActionError] = useState<string>();
  const [busy, setBusy] = useState(false);

  if (!state || state.kind === "loading") return <EmptyMessage>Loading document…</EmptyMessage>;
  if (state.kind === "notFound") return <PlaceholderNotice message="This document does not exist." />;
  if (state.kind === "error") return <PlaceholderNotice message={state.message} />;

  const document = state.data;

  async function handleDelete() {
    setBusy(true);
    setActionError(undefined);
    try {
      await deleteDocument(document.id);
      setConfirmDeleteOpen(false);
      navigate("/documents");
    } catch (error) {
      setActionError(describeError(error));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card>
      <div className="flex flex-col gap-4">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h2 className="text-title font-bold [overflow-wrap:anywhere]">{document.title}</h2>
            <p className="mt-1 text-caption text-ink-muted">
              <Link to={projectPath(document.projectId)} className={LINK_STYLE}>
                {document.projectName}
              </Link>{" "}
              · {document.workspaceName} · Last changed {formatDateTime(document.updatedAt)}
            </p>
          </div>
          <div className="flex shrink-0 gap-2">
            <Button variant="secondary" onClick={() => setEditOpen(true)}>
              Edit
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                setConfirmDeleteOpen(true);
                setActionError(undefined);
              }}
            >
              Delete
            </Button>
          </div>
        </div>
        <div>
          <KindBadge kind={document.kind} />
        </div>
        <div className="border-t border-border pt-4">
          {document.body ? (
            <p className="text-body whitespace-pre-wrap [overflow-wrap:anywhere]">{document.body}</p>
          ) : (
            <EmptyMessage>This document has no text yet. Use “Edit” to write it.</EmptyMessage>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2 border-t border-border pt-4">
          <Badge uppercase>Local document</Badge>
          <p className="text-caption text-ink-muted">
            Stored on this computer only. Created {formatDateTime(document.createdAt)}.
          </p>
        </div>
      </div>

      <DocumentFormDialog
        open={editOpen}
        title="Edit document"
        submitLabel="Save"
        initial={{ title: document.title, kind: document.kind, body: document.body }}
        onClose={() => setEditOpen(false)}
        onSubmit={(_projectId, title, kind, body) => updateDocument(document.id, title, kind, body)}
      />
      <ConfirmDialog
        open={confirmDeleteOpen}
        title="Delete this document?"
        message={`“${document.title}” will be deleted. This cannot be undone.`}
        confirmLabel="Delete document"
        error={actionError}
        busy={busy}
        onConfirm={() => void handleDelete()}
        onCancel={() => setConfirmDeleteOpen(false)}
      />
    </Card>
  );
}
