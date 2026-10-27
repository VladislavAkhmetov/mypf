import { projects } from "@/data/projects";
import { ProjectRedirect } from "./project-redirect";

// Legacy `/work/<slug>` links now open the project inside the desktop.
export const dynamicParams = false;

export function generateStaticParams() {
  return projects.map(project => ({ slug: project.slug }));
}

export default async function WorkRedirectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <ProjectRedirect href={`/?project=${encodeURIComponent(slug)}`} />;
}
