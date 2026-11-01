import { useEffect, useSyncExternalStore } from "react";
import * as documentService from "../services/documentService";
import { createKeyedLoader } from "./createKeyedLoader";

const LIST_KEY = "documents";
const listLoader = createKeyedLoader(() => documentService.getDocumentLibrary());
const detailLoader = createKeyedLoader(documentService.getDocument);

// All documents and the projects a new document can go into, read again whenever a screen using it is shown.
export function useDocumentLibrary() {
  const snapshot = useSyncExternalStore(listLoader.subscribe, listLoader.getSnapshot);

  useEffect(() => {
    void listLoader.load(LIST_KEY);
  }, []);

  return { state: listLoader.stateFor(snapshot, LIST_KEY) };
}

// One document with its text. The state is undefined when there is no document id in the address.
export function useDocumentDetail(documentId: string | undefined) {
  const snapshot = useSyncExternalStore(detailLoader.subscribe, detailLoader.getSnapshot);

  useEffect(() => {
    if (documentId) void detailLoader.load(documentId);
  }, [documentId]);

  return { state: detailLoader.stateFor(snapshot, documentId) };
}

// Changes to documents. Every action throws when it fails, so the screen can show the message.
// After a change the list and the open document are read again.
export function useDocumentActions() {
  async function refresh(documentId?: string) {
    await listLoader.load(LIST_KEY);
    if (documentId) await detailLoader.load(documentId);
  }

  return {
    // Returns the id of the new document.
    async createDocument(projectId: string, title: string, kind: string, body: string): Promise<string> {
      const id = await documentService.createDocument(projectId, title, kind, body);
      await refresh();
      return id;
    },
    async updateDocument(documentId: string, title: string, kind: string, body: string) {
      await documentService.updateDocument(documentId, title, kind, body);
      await refresh(documentId);
    },
    async deleteDocument(documentId: string) {
      await documentService.deleteDocument(documentId);
      await refresh();
    },
  };
}
