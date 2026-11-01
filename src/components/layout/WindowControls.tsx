import { useWindowMaximized } from "../../hooks/useWindowMaximized";
import { closeWindow, minimizeWindow, toggleMaximizeWindow } from "../../lib/windowControls";
import { Icon, type IconName } from "../icons/Icon";

const BUTTON_BASE =
  "inline-flex h-full w-11.5 items-center justify-center text-ink-muted outline-offset-[-2px] focus-visible:outline-2 focus-visible:outline-accent";

interface ControlButtonProps {
  icon: IconName;
  label: string;
  onClick: () => void;
  danger?: boolean;
}

// A failed window action (for example a missing permission) is ignored by the callers: the window stays as it is.
function ControlButton({ icon, label, onClick, danger = false }: ControlButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className={`${BUTTON_BASE} ${danger ? "hover:bg-danger hover:text-on-accent" : "hover:bg-titlebar-hover hover:text-ink"}`}
    >
      <Icon name={icon} className="size-4" />
    </button>
  );
}

// Minimize, maximize or restore, and close. They replace the buttons of the native Windows title bar.
export function WindowControls() {
  const maximized = useWindowMaximized();
  return (
    <div className="flex h-full shrink-0">
      <ControlButton icon="windowMinimize" label="Minimize" onClick={() => void minimizeWindow().catch(() => undefined)} />
      <ControlButton
        icon={maximized ? "windowRestore" : "windowMaximize"}
        label={maximized ? "Restore" : "Maximize"}
        onClick={() => void toggleMaximizeWindow().catch(() => undefined)}
      />
      <ControlButton icon="windowClose" label="Close" danger onClick={() => void closeWindow().catch(() => undefined)} />
    </div>
  );
}
