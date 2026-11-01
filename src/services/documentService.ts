import { hasVisibleText } from "../lib/text";
import { ValidationError } from "../lib/errors";
import * as repository from "../repositories/documentRepository";
import {
  DOCUMENT_KINDS,
  type DocumentDetail,
  type DocumentKind,
  type DocumentLibrary,
  type DocumentSummary,
} from "../types/document";

export const DOCUMENT_TITLE_MAX_LENGTH = 80;
export const DOCUMENT_BODY_MAX_LENGTH = 20000;

const KIND_LABELS: Record<DocumentKind, string> = {
  notes: "Notes",
  requirements: "Requirements",
  meeting: "Meeting notes",
  api: "API reference",
  design: "UI/UX decision",
};

// A short code for the small square in front of a document in a list.
const KIND_CODES: Record<DocumentKind, string> = { notes: "NOTE", requirements: "REQ", meeting: "MTG", api: "API", design: "UX" };

export function kindLabel(kind: DocumentKind): string {
  return KIND_LABELS[kind];
}

export function kindCode(kind: DocumentKind): string {
  return KIND_CODES[kind];
}

export const KIND_OPTIONS = DOCUMENT_KINDS.map((kind) => ({ value: kind, label: KIND_LABELS[kind] }));

// Business rules for the fields of a document. Returns the cleaned values or throws a ValidationError.
// The body keeps its line breaks and spaces; only empty space at both ends is removed.
function validateFields(
  titleInput: string,
  kind: string,
  bodyInput: string,
): { title: string; kind: DocumentKind; body: string } {
  const title = titleInput.trim();
  const body = bodyInput.trim();
  if (!hasVisibleText(title)) throw new ValidationError("Enter a document title.", "title");
  if (title.length > DOCUMENT_TITLE_MAX_LENGTH) {
    throw new ValidationError(`The title can have at most ${DOCUMENT_TITLE_MAX_LENGTH} characters.`, "title");
  }
  if (!DOCUMENT_KINDS.includes(kind as DocumentKind)) throw new ValidationError("Choose a document type.", "kind");
  if (body.length > DOCUMENT_BODY_MAX_LENGTH) {
    throw new ValidationError(`The text can have at most ${DOCUMENT_BODY_MAX_LENGTH} characters.`, "body");
  }
  return { title, kind: kind as DocumentKind, body };
}

export async function getDocumentLibrary(): Promise<DocumentLibrary> {
  const [documents, projects] = await Promise.all([repository.listDocuments(), repository.listProjectOptions()]);
  return { documents, projects };
}

export async function getDocument(id: string): Promise<DocumentDetail | undefined> {
  return repository.getDocument(id);
}

// Creates a document and returns its id.
export async function createDocument(projectId: string, titleInput: string, kind: string, bodyInput: string): Promise<string> {
  if (!projectId) throw new ValidationError("Choose a project.", "project");
  const { title, kind: cleanKind, body } = validateFields(titleInput, kind, bodyInput);
  const id = crypto.randomUUID();
  await repository.insertDocument({ id, projectId, title, kind: cleanKind, body, now: new Date().toISOString() });
  return id;
}

export async function updateDocument(id: string, titleInput: string, kind: string, bodyInput: string): Promise<void> {
  const { title, kind: cleanKind, body } = validateFields(titleInput, kind, bodyInput);
  const changed = await repository.updateDocument(id, title, cleanKind, body, new Date().toISOString());
  if (!changed) throw new ValidationError("This document no longer exists.");
}

export async function deleteDocument(id: string): Promise<void> {
  const deleted = await repository.deleteDocument(id);
  if (!deleted) throw new ValidationError("This document no longer exists.");
}

export interface DocumentFilter {
  // Text to look for in the title; upper and lower case do not matter. Empty means no search.
  query: string;
  kind: DocumentKind | "all";
  projectId: string | "all";
}

export function filterDocuments(documents: DocumentSummary[], filter: DocumentFilter): DocumentSummary[] {
  const query = filter.query.trim().toLowerCase();
  return documents.filter(
    (document) =>
      (query === "" || document.title.toLowerCase().includes(query)) &&
      (filter.kind === "all" || document.kind === filter.kind) &&
      (filter.projectId === "all" || document.projectId === filter.projectId),
  );
}
