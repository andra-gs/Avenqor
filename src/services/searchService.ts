import * as repository from "../repositories/searchRepository";
import { EMPTY_SEARCH_RESULTS, type SearchResults } from "../types/search";
import { TASK_STATUS_LABELS } from "../types/task";

// A search needs at least this many characters (one letter would match almost everything) and is cut at
// the maximum.
export const SEARCH_MIN_LENGTH = 2;
export const SEARCH_MAX_LENGTH = 80;
// Hits per group.
const GROUP_LIMIT = 6;

// What the person typed, cleaned for searching. Empty text means "do not search".
export function cleanSearchText(input: string): string {
  const text = input.trim().replace(/\s+/g, " ").slice(0, SEARCH_MAX_LENGTH);
  return text.length >= SEARCH_MIN_LENGTH ? text : "";
}

// Turns typed text into a LIKE pattern. %, _ and the escape character are made ordinary characters, so
// typing "50%" looks for "50%" and not for "50" followed by anything.
export function toLikePattern(text: string): string {
  return `%${text.replace(/[\\%_]/g, (character) => `\\${character}`)}%`;
}

const SNIPPET_BEFORE = 30;
const SNIPPET_AFTER = 60;

// A short piece of the text around the first match, on one line, with "…" where it was cut.
// Undefined when the text does not contain the typed text (the match was in the title).
export function makeSnippet(body: string, text: string): string | undefined {
  const index = body.toLowerCase().indexOf(text.toLowerCase());
  if (index < 0) return undefined;
  const start = Math.max(0, index - SNIPPET_BEFORE);
  const end = Math.min(body.length, index + text.length + SNIPPET_AFTER);
  const piece = body.slice(start, end).replace(/\s+/g, " ").trim();
  return `${start > 0 ? "…" : ""}${piece}${end < body.length ? "…" : ""}`;
}

// Searches workspaces, projects, tasks, and documents. Text that is too short gives no results.
export async function search(input: string): Promise<SearchResults> {
  const text = cleanSearchText(input);
  if (!text) return EMPTY_SEARCH_RESULTS;
  const pattern = toLikePattern(text);

  const [workspaces, projects, tasks, documents] = await Promise.all([
    repository.findWorkspaces(pattern, GROUP_LIMIT),
    repository.findProjects(pattern, GROUP_LIMIT),
    repository.findTasks(pattern, GROUP_LIMIT),
    repository.findDocuments(pattern, GROUP_LIMIT),
  ]);

  return {
    workspaces: workspaces.map((row) => ({ id: row.id, name: row.name })),
    projects: projects.map((row) => ({
      id: row.id,
      name: row.name,
      workspaceName: row.workspace_name,
      archived: row.status === "archived",
    })),
    tasks: tasks.map((row) => ({
      id: row.id,
      title: row.title,
      projectName: row.project_name,
      workspaceName: row.workspace_name,
      statusLabel: TASK_STATUS_LABELS[row.status],
    })),
    documents: documents.map((row) => ({
      id: row.id,
      title: row.title,
      projectName: row.project_name,
      // Only a match in the text needs a snippet; a match in the title is already visible.
      snippet: row.title.toLowerCase().includes(text.toLowerCase()) ? undefined : makeSnippet(row.body, text),
    })),
  };
}
