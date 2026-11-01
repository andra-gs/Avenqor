import { useId, type InputHTMLAttributes } from "react";
import { cx } from "../../lib/classNames";

// className is not accepted on purpose: the look lives here and in the tokens.
interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "className" | "id" | "type" | "children"> {
  label: string;
}

// A tick box with its text. The text is muted while the box is ticked.
export function Checkbox({ label, checked, ...rest }: CheckboxProps) {
  const id = useId();
  return (
    <div className="flex min-w-0 items-start gap-3">
      <input
        id={id}
        type="checkbox"
        checked={checked}
        className="mt-0.5 size-4 shrink-0 accent-accent outline-offset-2 focus-visible:outline-2 focus-visible:outline-accent"
        {...rest}
      />
      <label htmlFor={id} className={cx("min-w-0 text-body [overflow-wrap:anywhere]", checked && "text-ink-muted line-through")}>
        {label}
      </label>
    </div>
  );
}
