// The kinds of project document. They match the values stored in the database (migration 5).
export type DocumentKind = "notes" | "requirements" | "meeting" | "api" | "design";

export const DOCUMENT_KINDS: DocumentKind[] = ["notes", "requirements", "meeting", "api", "design"];

// A document as shown in lists: no body, because the body can be long.
export interface DocumentSummary {
  id: string;
  title: string;
  kind: DocumentKind;
  projectId: string;
  projectName: string;
  // UTC ISO 8601 timestamp.
  updatedAt: string;
}

export interface DocumentDetail extends DocumentSummary {
  body: string;
  workspaceId: string;
  workspaceName: string;
  createdAt: string;
}

// A project a new document can be written in.
export interface DocumentProjectOption {
  id: string;
  name: string;
  workspaceName: string;
}

// Everything the Documents page and the project page need for their lists.
export interface DocumentLibrary {
  documents: DocumentSummary[];
  projects: DocumentProjectOption[];
}
