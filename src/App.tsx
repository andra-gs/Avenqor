import { HashRouter, Route, Routes } from "react-router";
import { AppShell } from "./components/layout/AppShell";
import { ActivityPage } from "./pages/ActivityPage";
import { BoardPage } from "./pages/BoardPage";
import { CalendarPage } from "./pages/CalendarPage";
import { DashboardPage } from "./pages/DashboardPage";
import { DocumentsPage } from "./pages/DocumentsPage";
import { HelpPage } from "./pages/HelpPage";
import { MyTasksPage } from "./pages/MyTasksPage";
import { NotFoundPage } from "./pages/NotFoundPage";
import { ProjectPage } from "./pages/ProjectPage";
import { TaskPage } from "./pages/TaskPage";
import { SettingsPage } from "./pages/SettingsPage";
import { WorkspacePage } from "./pages/WorkspacePage";

// HashRouter keeps the current page in the part of the address after "#". A packaged desktop app has
// no web server to answer other addresses, so this is the safe choice for Tauri.
function App() {
  return (
    <HashRouter>
      <Routes>
        <Route element={<AppShell />}>
          <Route index element={<DashboardPage />} />
          <Route path="activity" element={<ActivityPage />} />
          <Route path="workspaces/:workspaceId/activity" element={<ActivityPage />} />
          <Route path="projects/:projectId/activity" element={<ActivityPage />} />
          <Route path="my-tasks" element={<MyTasksPage />} />
          <Route path="calendar" element={<CalendarPage />} />
          <Route path="documents/:documentId?" element={<DocumentsPage />} />
          <Route path="workspaces/:workspaceId" element={<WorkspacePage />} />
          <Route path="projects/:projectId" element={<ProjectPage />} />
          <Route path="projects/:projectId/board" element={<BoardPage />} />
          <Route path="tasks/:taskId" element={<TaskPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="help" element={<HelpPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}

export default App;
