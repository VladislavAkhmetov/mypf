"use client";

import { ProjectCover } from "@/components/project-cover";
import { projects } from "@/data/projects";

export function ProjectGrid() {
  return (
    <div className="project-grid">
      {projects.map((project) => (
        <ProjectCover key={project.slug} project={project} />
      ))}
    </div>
  );
}
