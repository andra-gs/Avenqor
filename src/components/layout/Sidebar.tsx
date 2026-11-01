import { NavLink } from "react-router";
import { FOOTER_NAV, MAIN_NAV, workspacePath } from "../../app/navigation";
import { useWorkspaces } from "../../hooks/useWorkspaces";
import { BrandLogo } from "../ui/BrandLogo";
import { cx } from "../../lib/classNames";
import { Icon, type IconName } from "../icons/Icon";
import { IconButton } from "../ui/IconButton";
import { SidebarResizeHandle } from "./SidebarResizeHandle";

interface SidebarProps {
  collapsed: boolean;
  onCollapsedChange: (collapsed: boolean) => void;
}

interface SidebarLinkProps {
  to: string;
  icon: IconName;
  label: string;
  collapsed: boolean;
}

const LINK_BASE =
  "flex h-10 items-center rounded-control text-body outline-offset-2 focus-visible:outline-2 focus-visible:outline-accent";
const LINK_ACTIVE = "bg-accent-soft font-medium text-accent";
const LINK_IDLE = "text-ink-muted hover:bg-surface-muted hover:text-ink";

// When the sidebar is collapsed only the icon is shown, so the name moves to a tooltip and a label.
function SidebarLink({ to, icon, label, collapsed }: SidebarLinkProps) {
  return (
    <NavLink
      to={to}
      end={to === "/"}
      title={collapsed ? label : undefined}
      aria-label={collapsed ? label : undefined}
      className={({ isActive }) =>
        cx(LINK_BASE, collapsed ? "justify-center" : "gap-3 px-3", isActive ? LINK_ACTIVE : LINK_IDLE)
      }
    >
      <Icon name={icon} className="size-5 shrink-0" />
      {!collapsed && <span className="truncate">{label}</span>}
    </NavLink>
  );
}

export function Sidebar({ collapsed, onCollapsedChange }: SidebarProps) {
  const { state: workspacesState } = useWorkspaces();
  const toggleLabel = collapsed ? "Expand sidebar" : "Collapse sidebar";

  return (
    <aside
      className={cx(
        "relative flex shrink-0 flex-col border-r border-border bg-surface",
        collapsed ? "w-(--layout-sidebar-collapsed-width)" : "w-(--layout-sidebar-width)",
      )}
    >
      {collapsed ? (
        <div className="flex flex-col items-center py-4">
          <IconButton icon="chevronsRight" label={toggleLabel} onClick={() => onCollapsedChange(false)} />
        </div>
      ) : (
        <div className="flex items-start justify-between gap-2 py-4 pr-3 pl-6">
          <div className="min-w-0 pt-1">
            <BrandLogo variant="wordmark" />
          </div>
          <IconButton icon="chevronsLeft" label={toggleLabel} onClick={() => onCollapsedChange(true)} />
        </div>
      )}

      {/* The top padding leaves room for the focus outline of the first item; a scrolling box cuts off anything outside it. */}
      <nav aria-label="Main" className="flex-1 overflow-y-auto px-3.5 pt-1.5 pb-4">
        <div className="flex flex-col gap-1">
          {MAIN_NAV.map((item) => (
            <SidebarLink key={item.path} to={item.path} icon={item.icon} label={item.label} collapsed={collapsed} />
          ))}
        </div>

        {collapsed ? (
          <hr className="my-4 border-border" />
        ) : (
          <p className="mt-6 mb-2 px-3 text-micro font-bold uppercase text-ink-muted">Workspaces</p>
        )}
        {!collapsed && workspacesState.kind === "ready" && workspacesState.workspaces.length === 0 && (
          <p className="px-3 text-caption text-ink-muted">No workspaces yet. Create one in Settings.</p>
        )}
        {!collapsed && workspacesState.kind === "error" && (
          <p className="px-3 text-caption text-danger">Workspaces could not be loaded.</p>
        )}
        <div className="flex flex-col gap-1">
          {(workspacesState.kind === "ready" ? workspacesState.workspaces : []).map((workspace) => (
            <SidebarLink
              key={workspace.id}
              to={workspacePath(workspace.id)}
              icon="workspace"
              label={workspace.name}
              collapsed={collapsed}
            />
          ))}
        </div>
      </nav>

      <nav aria-label="Secondary" className="flex flex-col gap-1 px-3.5 pb-4">
        {FOOTER_NAV.map((item) => (
          <SidebarLink key={item.path} to={item.path} icon={item.icon} label={item.label} collapsed={collapsed} />
        ))}
      </nav>

      <SidebarResizeHandle collapsed={collapsed} onCollapsedChange={onCollapsedChange} />
    </aside>
  );
}
