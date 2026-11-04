import { useEffect, useRef, type ReactNode } from "react";

interface DialogProps {
  open: boolean;
  title: string;
  // Called when the user presses Escape. Ignored while `busy` is true.
  onClose: () => void;
  busy?: boolean;
  children: ReactNode;
}

// A window above the page. It uses the browser's built-in <dialog>, which traps keyboard focus and
// closes with the Escape key. Put a form inside as `{open && <Form />}` so the form starts empty each time.
export function Dialog({ open, title, onClose, busy, children }: DialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      onCancel={(event) => {
        event.preventDefault();
        if (!busy) onClose();
      }}
      className="m-auto max-h-[calc(100dvh-1.5rem)] w-[calc(100%-1.5rem)] max-w-md overflow-y-auto rounded-card border border-border bg-surface p-4 text-ink backdrop:bg-ink/40 md:w-full md:p-6"
    >
      <h2 className="text-heading font-bold">{title}</h2>
      {children}
    </dialog>
  );
}
