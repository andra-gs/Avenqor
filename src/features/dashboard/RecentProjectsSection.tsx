import { EmptyMessage } from "../../components/ui/EmptyMessage";
import { SectionHeading } from "../../components/ui/SectionHeading";
import { ProjectCard } from "../projects/ProjectCard";
import type { ProjectSummary } from "../../types/project";

export function RecentProjectsSection({ projects }: { projects: ProjectSummary[] }) {
  return (
    <section className="flex flex-col gap-3">
      <SectionHeading>Recent Projects</SectionHeading>
      {projects.length === 0 ? (
        <EmptyMessage>No projects yet. Create a workspace in Settings, then add a project.</EmptyMessage>
      ) : (
        <div className="grid grid-cols-3 gap-4">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </section>
  );
}
