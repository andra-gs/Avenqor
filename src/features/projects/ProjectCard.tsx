import { projectPath } from "../../app/navigation";
import { LinkCard } from "../../components/ui/LinkCard";
import { ProgressBar } from "../../components/ui/ProgressBar";
import type { ProjectSummary } from "../../types/project";

interface ProjectCardProps {
  project: ProjectSummary;
}

// One project as a card: name, description, and progress. Opens the project overview when clicked.
export function ProjectCard({ project }: ProjectCardProps) {
  return (
    <LinkCard to={projectPath(project.id)}>
      <div className="flex min-h-32 flex-col justify-between gap-4">
        <div>
          <p className="text-body-lg font-semibold break-words">{project.name}</p>
          {/* The whole description is shown. Line breaks typed by the user are kept. */}
          <p className="mt-0.5 text-caption whitespace-pre-line text-ink-muted break-words">{project.description}</p>
        </div>
        <div className="flex flex-col gap-2">
          <p className="text-caption font-medium text-ink-muted">{project.progressPercent}% complete</p>
          <ProgressBar value={project.progressPercent} label={`${project.name} progress`} />
        </div>
      </div>
    </LinkCard>
  );
}
