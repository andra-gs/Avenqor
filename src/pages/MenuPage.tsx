import { FOOTER_NAV, workspacePath } from "../app/navigation";
import { EmptyMessage } from "../components/ui/EmptyMessage";
import { LinkCard } from "../components/ui/LinkCard";
import { SectionHeading } from "../components/ui/SectionHeading";
import { useWorkspaces } from "../hooks/useWorkspaces";

// The page behind the "Menu" button of the bottom navigation (phone). It holds what the sidebar holds on
// desktop and does not fit in the bar: the workspaces, Settings, and Help.
export function MenuPage() {
  const { state } = useWorkspaces();

  return (
    <div className="flex flex-col gap-8">
      <section className="flex flex-col gap-3">
        <SectionHeading>Workspaces</SectionHeading>
        {state.kind === "ready" && state.workspaces.length === 0 && (
          <EmptyMessage>No workspaces yet. Create one in Settings.</EmptyMessage>
        )}
        {state.kind === "error" && <EmptyMessage>Workspaces could not be loaded.</EmptyMessage>}
        {state.kind === "ready" &&
          state.workspaces.map((workspace) => (
            <LinkCard key={workspace.id} to={workspacePath(workspace.id)}>
              <p className="truncate text-body font-semibold">{workspace.name}</p>
            </LinkCard>
          ))}
      </section>

      <section className="flex flex-col gap-3">
        <SectionHeading>More</SectionHeading>
        {FOOTER_NAV.map((item) => (
          <LinkCard key={item.path} to={item.path}>
            <p className="text-body font-semibold">{item.label}</p>
            <p className="text-caption text-ink-muted">{item.subtitle}</p>
          </LinkCard>
        ))}
      </section>
    </div>
  );
}
