import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import { documentPath } from "../app/navigation";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { EmptyMessage } from "../components/ui/EmptyMessage";
import { PlaceholderNotice } from "../components/ui/PlaceholderNotice";
import { SelectField } from "../components/ui/SelectField";
import { TextField } from "../components/ui/TextField";
import { DocumentFormDialog } from "../features/documents/DocumentFormDialog";
import { DocumentList } from "../features/documents/DocumentList";
import { DocumentView } from "../features/documents/DocumentView";
import { useDocumentActions, useDocumentLibrary } from "../hooks/useDocuments";
import { filterDocuments, KIND_OPTIONS } from "../services/documentService";
import type { DocumentKind } from "../types/document";

// Documents of all projects. The list is on the left; the open document (the address ends with its id)
// is on the right. On a narrow window the two are stacked.
export function DocumentsPage() {
  const { documentId } = useParams();
  const navigate = useNavigate();
  const { state } = useDocumentLibrary();
  const { createDocument } = useDocumentActions();
  const [query, setQuery] = useState("");
  const [kind, setKind] = useState<DocumentKind | "all">("all");
  const [projectId, setProjectId] = useState("all");
  const [newOpen, setNewOpen] = useState(false);

  if (!state || state.kind === "loading") return <EmptyMessage>Loading documents…</EmptyMessage>;
  if (state.kind === "error") return <PlaceholderNotice message={state.message} />;
  if (state.kind === "notFound") return <PlaceholderNotice message="The documents could not be loaded." />;

  const { documents, projects } = state.data;
  const visible = filterDocuments(documents, { query, kind, projectId });
  const filtering = query.trim() !== "" || kind !== "all" || projectId !== "all";
  const projectChoices = [
    { value: "all", label: "All projects" },
    ...Array.from(new Map(documents.map((document) => [document.projectId, document.projectName])).entries()).map(
      ([value, label]) => ({ value, label }),
    ),
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <Button icon="plus" disabled={projects.length === 0} onClick={() => setNewOpen(true)}>
          New Document
        </Button>
      </div>
      {projects.length === 0 && (
        <p className="text-caption text-ink-muted">Create a project first: every document belongs to a project.</p>
      )}
      <div className="grid grid-cols-[minmax(0,1fr)] items-start gap-6 lg:grid-cols-[24rem_minmax(0,1fr)]">
        <Card>
          <div className="flex flex-col gap-4">
            <TextField label="Search by title" value={query} onChange={(event) => setQuery(event.target.value)} />
            <div className="grid grid-cols-2 gap-3">
              <SelectField
                label="Type"
                value={kind}
                options={[{ value: "all", label: "All types" }, ...KIND_OPTIONS]}
                onChange={(event) => setKind(event.target.value as DocumentKind | "all")}
              />
              <SelectField
                label="Project"
                value={projectId}
                options={projectChoices}
                onChange={(event) => setProjectId(event.target.value)}
              />
            </div>
            <DocumentList
              documents={visible}
              selectedId={documentId}
              emptyMessage={filtering ? "No document matches the search." : "No documents yet."}
            />
          </div>
        </Card>
        <div className="min-w-0">
          {documentId ? (
            <DocumentView key={documentId} documentId={documentId} />
          ) : (
            <Card>
              <EmptyMessage>Select a document to read it.</EmptyMessage>
            </Card>
          )}
        </div>
      </div>
      <DocumentFormDialog
        open={newOpen}
        title="New document"
        submitLabel="Create document"
        projects={projects}
        onClose={() => setNewOpen(false)}
        onSubmit={async (id, title, newKind, body) => {
          navigate(documentPath(await createDocument(id, title, newKind, body)));
        }}
      />
    </div>
  );
}
