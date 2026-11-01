import type { ReactNode } from "react";

export type IconName =
  | "dashboard"
  | "tasks"
  | "calendar"
  | "documents"
  | "workspace"
  | "settings"
  | "help"
  | "plus"
  | "chevronsLeft"
  | "chevronsRight"
  | "close"
  | "more"
  | "search"
  | "pencil"
  | "arrowLeft"
  | "arrowRight"
  | "windowMinimize"
  | "windowMaximize"
  | "windowRestore"
  | "windowClose";

// Simple outline icons drawn for this app. They use the current text color, so they follow tokens.
const PATHS: Record<IconName, ReactNode> = {
  dashboard: (
    <>
      <rect x="3" y="3" width="7.5" height="7.5" rx="1.5" />
      <rect x="13.5" y="3" width="7.5" height="7.5" rx="1.5" />
      <rect x="3" y="13.5" width="7.5" height="7.5" rx="1.5" />
      <rect x="13.5" y="13.5" width="7.5" height="7.5" rx="1.5" />
    </>
  ),
  tasks: (
    <>
      <rect x="3" y="3" width="18" height="18" rx="4" />
      <path d="M8 12.5l3 3 5-6" />
    </>
  ),
  calendar: (
    <>
      <rect x="3" y="5" width="18" height="16" rx="3" />
      <path d="M3 10h18M8 3v4M16 3v4" />
    </>
  ),
  documents: (
    <>
      <path d="M7 3h7l5 5v13H7z" />
      <path d="M14 3v5h5" />
    </>
  ),
  workspace: (
    <>
      <rect x="3" y="3" width="18" height="18" rx="4" />
      <rect x="8" y="8" width="8" height="8" rx="1.5" />
    </>
  ),
  settings: (
    <>
      <path d="M4 7h8M18 7h2M4 17h2M12 17h8" />
      <circle cx="15" cy="7" r="2.5" />
      <circle cx="9" cy="17" r="2.5" />
    </>
  ),
  plus: <path d="M12 5v14M5 12h14" />,
  chevronsLeft: <path d="M11 17l-5-5 5-5M18 17l-5-5 5-5" />,
  chevronsRight: <path d="M13 17l5-5-5-5M6 17l5-5-5-5" />,
  close: <path d="M6 6l12 12M18 6L6 18" />,
  more: <path d="M12 5h.01M12 12h.01M12 19h.01" />,
  pencil: <path d="M4 20h4L19 9a2.1 2.1 0 0 0-4-4L4 16v4zM13.5 6.5l4 4" />,
  search: (
    <>
      <circle cx="11" cy="11" r="6.5" />
      <path d="M16 16l4.5 4.5" />
    </>
  ),
  arrowLeft: <path d="M19 12H5M11 18l-6-6 6-6" />,
  arrowRight: <path d="M5 12h14M13 6l6 6-6 6" />,
  windowMinimize: <path d="M5 12h14" />,
  windowMaximize: <rect x="5" y="5" width="14" height="14" rx="1" />,
  windowRestore: <path d="M9 9V5h10v10h-4M5 9h10v10H5z" />,
  windowClose: <path d="M6 6l12 12M18 6L6 18" />,
  help: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.7.4-1 .9-1 1.7M12 17h.01" />
    </>
  ),
};

interface IconProps {
  name: IconName;
  className?: string;
}

export function Icon({ name, className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      {PATHS[name]}
    </svg>
  );
}
