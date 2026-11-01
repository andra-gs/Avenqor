import type { ReactNode } from "react";

// The counter appears once the text uses this share of the limit (0.1 = 10 percent).
const COUNTER_SHOW_RATIO = 0.1;

interface FieldFooterProps {
  errorId: string;
  error?: string;
  // The text in the box and its limit. The counter shows only when both are given and enough is typed.
  value?: string;
  maxLength?: number;
}

// The line under a text box: the error message on the left and, once enough is typed, the character
// counter on the right. The browser itself stops typing at the limit, so no message is needed for that.
export function FieldFooter({ errorId, error, value, maxLength }: FieldFooterProps): ReactNode {
  const showCounter = maxLength !== undefined && value !== undefined && value.length >= maxLength * COUNTER_SHOW_RATIO;
  if (!error && !showCounter) return null;
  return (
    <div className="flex items-start justify-between gap-3">
      {error ? (
        <p id={errorId} className="text-caption text-danger">
          {error}
        </p>
      ) : (
        <span />
      )}
      {showCounter && (
        <p className="shrink-0 text-caption text-ink-muted">
          {value.length} / {maxLength}
        </p>
      )}
    </div>
  );
}
