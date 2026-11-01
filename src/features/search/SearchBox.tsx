import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import { useNavigate } from "react-router";
import { documentPath, projectPath, taskPath, workspacePath } from "../../app/navigation";
import { Icon } from "../../components/icons/Icon";
import { cx } from "../../lib/classNames";
import { SEARCH_MAX_LENGTH, SEARCH_MIN_LENGTH } from "../../services/searchService";
import { useSearch } from "../../hooks/useSearch";
import type { SearchResults } from "../../types/search";

// One line in the list of results, whatever it is.
interface ResultLine {
  key: string;
  group: string;
  title: string;
  detail?: string;
  to: string;
}

function toLines(results: SearchResults): ResultLine[] {
  return [
    ...results.workspaces.map((hit) => ({ key: `w-${hit.id}`, group: "Workspaces", title: hit.name, to: workspacePath(hit.id) })),
    ...results.projects.map((hit) => ({
      key: `p-${hit.id}`,
      group: "Projects",
      title: hit.name,
      detail: `${hit.workspaceName}${hit.archived ? " · Archived" : ""}`,
      to: projectPath(hit.id),
    })),
    ...results.tasks.map((hit) => ({
      key: `t-${hit.id}`,
      group: "Tasks",
      title: hit.title,
      detail: `${hit.projectName} · ${hit.statusLabel}`,
      to: taskPath(hit.id),
    })),
    ...results.documents.map((hit) => ({
      key: `d-${hit.id}`,
      group: "Documents",
      title: hit.title,
      detail: hit.snippet ?? hit.projectName,
      to: documentPath(hit.id),
    })),
  ];
}

// The search box in the top bar. Ctrl+K jumps into it. Arrow keys move through the results, Enter opens
// the chosen one, and Escape clears the box.
export function SearchBox() {
  const navigate = useNavigate();
  const listId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [text, setText] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const { results, searching, error, tooShort } = useSearch(text);
  const lines = toLines(results);

  // Ctrl+K from anywhere in the app.
  useEffect(() => {
    function onKeyDown(event: globalThis.KeyboardEvent) {
      if (event.ctrlKey && event.key.toLowerCase() === "k") {
        event.preventDefault();
        inputRef.current?.focus();
        inputRef.current?.select();
        setOpen(true);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  // A click outside the box closes the results.
  useEffect(() => {
    if (!open) return;
    function onMouseDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onMouseDown);
    return () => document.removeEventListener("mousedown", onMouseDown);
  }, [open]);

  // New results start at the first line.
  useEffect(() => setActive(0), [results]);

  function choose(line: ResultLine) {
    navigate(line.to);
    setText("");
    setOpen(false);
    inputRef.current?.blur();
  }

  function onInputKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Escape") {
      event.preventDefault();
      if (text) setText("");
      else inputRef.current?.blur();
      setOpen(false);
    } else if (event.key === "ArrowDown" && lines.length > 0) {
      event.preventDefault();
      setOpen(true);
      setActive((value) => (value + 1) % lines.length);
    } else if (event.key === "ArrowUp" && lines.length > 0) {
      event.preventDefault();
      setActive((value) => (value - 1 + lines.length) % lines.length);
    } else if (event.key === "Enter" && open && lines[active]) {
      event.preventDefault();
      choose(lines[active]);
    }
  }

  const showPanel = open && text.trim().length > 0;
  let note: string | undefined;
  if (error) note = error;
  else if (tooShort) note = `Type at least ${SEARCH_MIN_LENGTH} characters.`;
  else if (lines.length === 0) note = searching ? "Searching…" : `No results for “${text.trim()}”.`;

  return (
    <div ref={rootRef} className="relative w-72">
      <Icon name="search" className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-ink-muted" />
      <input
        ref={inputRef}
        id="search-box"
        name="search"
        type="text"
        role="combobox"
        aria-label="Search workspaces, projects, tasks, and documents"
        aria-expanded={showPanel}
        aria-controls={showPanel ? listId : undefined}
        aria-activedescendant={showPanel && lines[active] ? `${listId}-${lines[active].key}` : undefined}
        placeholder="Search…  Ctrl+K"
        maxLength={SEARCH_MAX_LENGTH}
        // Without this the Windows web view offers its "Saved info" list while typing.
        autoComplete="off"
        value={text}
        onChange={(event) => {
          setText(event.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={onInputKeyDown}
        className="h-9 w-full rounded-control border border-border bg-surface-muted pr-3 pl-9 text-body outline-offset-2 placeholder:text-ink-muted focus-visible:outline-2 focus-visible:outline-accent"
      />
      {showPanel && (
        <div
          id={listId}
          role="listbox"
          aria-label="Search results"
          // Keeps the focus in the box while the mouse is used on the list.
          onMouseDown={(event) => event.preventDefault()}
          className="absolute right-0 z-20 mt-1 max-h-96 w-112 overflow-y-auto rounded-control border border-border bg-surface p-1"
        >
          {note && <p className={cx("px-3 py-2 text-body", error ? "text-danger" : "text-ink-muted")}>{note}</p>}
          {lines.map((line, index) => (
            <div key={line.key}>
              {(index === 0 || lines[index - 1].group !== line.group) && (
                <p className="px-3 pt-2 pb-1 text-caption font-semibold tracking-wide text-ink-muted uppercase">{line.group}</p>
              )}
              <button
                type="button"
                role="option"
                id={`${listId}-${line.key}`}
                aria-selected={index === active}
                onMouseEnter={() => setActive(index)}
                onClick={() => choose(line)}
                className={cx(
                  "flex w-full flex-col rounded-control px-3 py-1.5 text-left",
                  index === active ? "bg-accent-soft" : "hover:bg-surface-muted",
                )}
              >
                <span className="w-full truncate text-body font-semibold">{line.title}</span>
                {line.detail && <span className="w-full truncate text-caption text-ink-muted">{line.detail}</span>}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
