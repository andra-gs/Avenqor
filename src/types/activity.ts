export interface ActivityEntry {
  id: string;
  actorName: string;
  action: string;
  // ISO date-time text.
  occurredAt: string;
  // Set when the entry is shown outside its project, for example in a workspace.
  projectName?: string;
}

// Which history a screen reads: everything, one workspace, or one project.
export type ActivityScope = { kind: "all" } | { kind: "workspace"; id: string } | { kind: "project"; id: string };
