// The six colors a label can have. The names match the badge tones, so the interface maps them to the
// color tokens and the database stores only the name (migration 4).
export type LabelColor = "neutral" | "accent" | "success" | "danger" | "info" | "warning";

export const LABEL_COLORS: LabelColor[] = ["neutral", "accent", "success", "danger", "info", "warning"];

export interface Label {
  id: string;
  name: string;
  color: LabelColor;
}

// A label of a project with the number of tasks that carry it.
export interface ProjectLabel extends Label {
  taskCount: number;
}
