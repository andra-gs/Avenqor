import { useState } from "react";
import { useNavigate } from "react-router";
import { documentPath } from "../../app/navigation";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { EmptyMessage } from "../../components/ui/EmptyMessage";
import { SectionHeading } from "../../components/ui/SectionHeading";
import { useDocumentActions, useDocumentLibrary } from "../../hooks/useDocuments";
import { DocumentFormDialog } from "./DocumentFormDialog";
import { DocumentList } from "./DocumentList";

// The documents of one project on its page, with a button to write a new one.
export function ProjectDocumentsSection({ projectId }: { projectId: string }) {
  const navigate = useNavigate();
  const { state } = useDocumentLibrary();
  const { createDocument } = useDocumentActions();
  const [newOpen, setNewOpen] = useState(false);

  const documents = state?.kind === "ready" ? state.data.documents.filter((document) => document.projectId === projectId) : [];

  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-4">
        <SectionHeading>Documents</SectionHeading>
        <Button icon="plus" onClick={() => setNewOpen(true)}>
          New Document
        </Button>
      </div>
      <Card>
        {state?.kind === "error" ? (
          <p className="text-body text-danger">{state.message}</p>
        ) : state?.kind === "ready" ? (
          <DocumentList documents={documents} emptyMessage="No documents yet." showProject={false} />
        ) : (
          <EmptyMessage>Loading documents…</EmptyMessage>
        )}
      </Card>
      <DocumentFormDialog
        open={newOpen}
        title="New document"
        submitLabel="Create document"
        initialProjectId={projectId}
        onClose={() => setNewOpen(false)}
        onSubmit={async (id, title, kind, body) => {
          const documentId = await createDocument(id, title, kind, body);
          navigate(documentPath(documentId));
        }}
      />
    </section>
  );
}
