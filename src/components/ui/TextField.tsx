import { useId, type InputHTMLAttributes } from "react";
import { FieldFooter } from "./FieldFooter";

// className is not accepted on purpose: the look lives here and in the tokens.
interface TextFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "className" | "id" | "type"> {
  label: string;
  // "date" shows a date picker; its value is written "YYYY-MM-DD". "time" shows a time box, written "HH:MM".
  type?: "text" | "date" | "time";
  error?: string;
}

export function TextField({ label, error, type = "text", ...rest }: TextFieldProps) {
  const id = useId();
  const errorId = `${id}-error`;
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-small font-medium">
        {label}
      </label>
      <input
        id={id}
        type={type}
        // Without this the Windows web view offers its "Saved info" list while typing.
        autoComplete="off"
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        className="h-9 rounded-control border border-border bg-surface px-3 text-body outline-offset-2 placeholder:text-ink-muted focus-visible:outline-2 focus-visible:outline-accent aria-invalid:border-danger"
        {...rest}
      />
      <FieldFooter
        errorId={errorId}
        error={error}
        value={typeof rest.value === "string" ? rest.value : undefined}
        maxLength={rest.maxLength}
      />
    </div>
  );
}
