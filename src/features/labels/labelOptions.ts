import { LABEL_COLORS, type LabelColor } from "../../types/label";

const COLOR_NAMES: Record<LabelColor, string> = {
  neutral: "Gray",
  accent: "Indigo",
  success: "Green",
  danger: "Red",
  info: "Blue",
  warning: "Amber",
};

export function colorName(color: LabelColor): string {
  return COLOR_NAMES[color];
}

// The choices of a color list in a form.
export const COLOR_OPTIONS = LABEL_COLORS.map((color) => ({ value: color, label: COLOR_NAMES[color] }));
