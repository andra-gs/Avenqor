// What a search finds. Each hit carries the id of the thing; the screen decides where it links to.
export interface WorkspaceHit {
  id: string;
  name: string;
}

export interface ProjectHit {
  id: string;
  name: string;
  workspaceName: string;
  archived: boolean;
}

export interface TaskHit {
  id: string;
  title: string;
  projectName: string;
  workspaceName: string;
  // "To Do", "In Progress", "Review", or "Done".
  statusLabel: string;
}

export interface DocumentHit {
  id: string;
  title: string;
  projectName: string;
  // A short piece of the text around the match, when the match is in the text and not in the title.
  snippet?: string;
}

export interface SearchResults {
  workspaces: WorkspaceHit[];
  projects: ProjectHit[];
  tasks: TaskHit[];
  documents: DocumentHit[];
}

export const EMPTY_SEARCH_RESULTS: SearchResults = { workspaces: [], projects: [], tasks: [], documents: [] };
