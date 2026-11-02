import { Outlet } from "react-router";
import { useReminderChecks } from "../../hooks/useReminderChecks";
import { useSidebarCollapsed } from "../../hooks/useSidebarCollapsed";
import { HAS_DESKTOP_WINDOW } from "../../lib/platform";
import { BottomNav } from "./BottomNav";
import { Sidebar } from "./Sidebar";
import { TitleBar } from "./TitleBar";
import { TopBar } from "./TopBar";

// The frame around every screen: the title bar on top (desktop only: a phone has no window), then the sidebar on the left and the top bar and page content on the right.
export function AppShell() {
  const { collapsed, setCollapsed } = useSidebarCollapsed();
  useReminderChecks();

  return (
    <div className="flex h-screen flex-col">
      {HAS_DESKTOP_WINDOW && <TitleBar />}
      <div className="flex min-h-0 flex-1">
        <Sidebar collapsed={collapsed} onCollapsedChange={setCollapsed} />
        <div className="flex min-w-0 flex-1 flex-col">
          <TopBar />
          <main className="flex-1 overflow-auto px-4 py-5 md:px-9 md:py-8">
            <Outlet />
          </main>
          <BottomNav />
        </div>
      </div>
    </div>
  );
}
