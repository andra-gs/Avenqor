import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import { cx } from "../../lib/classNames";
import { Icon } from "../icons/Icon";

export interface ActionMenuItem {
  label: string;
  onSelect: () => void;
  // "danger" colors the item red, for actions such as Delete.
  tone?: "default" | "danger";
  disabled?: boolean;
}

interface ActionMenuProps {
  // Names the button for screen readers and the tooltip, for example "Actions for Draft report".
  label: string;
  items: ActionMenuItem[];
  disabled?: boolean;
}

const ITEM_BASE =
  "flex h-9 w-full items-center rounded-control px-3 text-left text-body outline-offset-[-2px] focus-visible:outline-2 focus-visible:outline-accent disabled:cursor-not-allowed disabled:opacity-50";

// One button that opens a small list of actions. It closes when an action is chosen, when the user
// clicks elsewhere, or on Escape. The arrow keys move between the actions.
export function ActionMenu({ label, items, disabled }: ActionMenuProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuId = useId();

  useEffect(() => {
    if (!open) return;
    function handlePointerDown(event: PointerEvent) {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [open]);

  // Put the keyboard focus on the first action when the menu opens.
  useEffect(() => {
    if (open) rootRef.current?.querySelector<HTMLButtonElement>('[role="menuitem"]:not(:disabled)')?.focus();
  }, [open]);

  function close(returnFocus: boolean) {
    setOpen(false);
    if (returnFocus) buttonRef.current?.focus();
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "Escape") {
      event.stopPropagation();
      close(true);
      return;
    }
    if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
    event.preventDefault();
    const found = rootRef.current?.querySelectorAll<HTMLButtonElement>('[role="menuitem"]:not(:disabled)');
    const entries: HTMLButtonElement[] = found ? Array.from(found) : [];
    if (entries.length === 0) return;
    const current = entries.indexOf(document.activeElement as HTMLButtonElement);
    const step = event.key === "ArrowDown" ? 1 : -1;
    entries[(current + step + entries.length) % entries.length].focus();
  }

  return (
    <div ref={rootRef} className="relative" onKeyDown={handleKeyDown}>
      <button
        ref={buttonRef}
        type="button"
        aria-label={label}
        title={label}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        disabled={disabled}
        onClick={() => setOpen((value) => !value)}
        className="inline-flex size-9 items-center justify-center rounded-control border border-border bg-surface text-ink-muted outline-offset-2 hover:bg-surface-muted hover:text-ink focus-visible:outline-2 focus-visible:outline-accent disabled:cursor-not-allowed disabled:opacity-50"
      >
        <Icon name="more" className="size-5" />
      </button>
      {open && (
        <div
          id={menuId}
          role="menu"
          aria-label={label}
          className="absolute right-0 z-10 mt-1 flex min-w-40 flex-col rounded-control border border-border bg-surface p-1"
        >
          {items.map((item) => (
            <button
              key={item.label}
              type="button"
              role="menuitem"
              disabled={item.disabled}
              onClick={() => {
                close(false);
                item.onSelect();
              }}
              className={cx(ITEM_BASE, item.tone === "danger" ? "text-danger hover:bg-danger-soft" : "text-ink hover:bg-surface-muted")}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
