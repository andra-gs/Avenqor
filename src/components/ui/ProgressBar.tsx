import { cx } from "../../lib/classNames";

interface ProgressBarProps {
  // 0 to 100. Values outside the range are limited to it.
  value: number;
  // What the bar measures, for screen readers. Example: "Campus Game progress". The fill is always the accent color.
  label: string;
  size?: "md" | "lg";
}

const SIZES = {
  md: "h-1.5",
  lg: "h-2.5",
};

export function ProgressBar({ value, label, size = "md" }: ProgressBarProps) {
  const percent = Number.isFinite(value) ? Math.min(100, Math.max(0, value)) : 0;
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(percent)}
      className={cx("w-full overflow-hidden rounded-bar bg-track", SIZES[size])}
    >
      <div className={"h-full rounded-bar bg-accent"} style={{ width: `${percent}%` }} />
    </div>
  );
}
