import { NavLink } from "react-router";
import { MAIN_NAV, MENU_NAV } from "../../app/navigation";
import { cx } from "../../lib/classNames";
import { Icon } from "../icons/Icon";

const ITEM_BASE =
  "flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 text-micro outline-offset-[-2px] focus-visible:outline-2 focus-visible:outline-accent";

// The main navigation on a narrow screen (phone): the four main pages and a "Menu" page for the rest
// (workspaces, settings, help). It replaces the sidebar, which is hidden on narrow screens. The bar is a fixed-height row inside a box whose
// bottom padding keeps the buttons clear of the phone's own navigation bar.
export function BottomNav() {
  return (
    <nav
      aria-label="Main"
      className="shrink-0 border-t border-border bg-surface pb-[env(safe-area-inset-bottom)] md:hidden"
    >
      <div className="flex h-(--layout-bottomnav-height) items-stretch">
        {[...MAIN_NAV, MENU_NAV].map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === "/"}
            className={({ isActive }) => cx(ITEM_BASE, isActive ? "font-medium text-accent" : "text-ink-muted")}
          >
            <Icon name={item.icon} className="size-5 shrink-0" />
            <span className="max-w-full truncate">{item.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
