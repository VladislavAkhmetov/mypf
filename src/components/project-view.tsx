"use client";

import { GlowFill } from "@/components/project-cover";
import { LangSwitch } from "@/components/lang-switch";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getAdjacent, type Project } from "@/data/projects";
import { site } from "@/data/site";
import { useLocale } from "../lib/i18n";
import { useEffect } from "react";

function BackIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className="project-back-ico">
      <path
        fill="currentColor"
        d="M14.7 5.3a1 1 0 0 1 0 1.4L9.4 12l5.3 5.3a1 1 0 1 1-1.4 1.4l-6-6a1 1 0 0 1 0-1.4l6-6a1 1 0 0 1 1.4 0Z"
      />
    </svg>
  );
}

export function ProjectView({ project }: { project: Project }) {
  const { t, locale } = useLocale();
  const router = useRouter();
  const { prev, next } = getAdjacent(project.slug);
  const tags = project.tags[locale];
  const linkLabel = project.linkLabel ? t(project.linkLabel) : t(site.ui.open);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") router.push("/");
      if (e.key === "ArrowRight" && next) router.push(`/work/${next.slug}`);
      if (e.key === "ArrowLeft" && prev) router.push(`/work/${prev.slug}`);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [next, prev, router]);

  return (
    <div className="project-page">
      <header className="project-top">
        <Link href="/" className="project-back">
          <BackIcon />
          {t(site.ui.back)}
        </Link>
        <LangSwitch />
      </header>
      <div className="project-body">
        <div className="project-hero">
          <GlowFill
            glow={project.glow}
            motif={project.motif}
            image={project.cover}
            sizes="(max-width: 960px) 92vw, 52vw"
            className="h-full w-full"
          />
        </div>
        <div className="project-meta">
          <h1>{project.title}</h1>
          <p className="project-text">{t(project.body)}</p>
          {tags.length > 0 ? (
            <ul className="project-tags">
              {tags.map((tag) => (
                <li key={tag}>{tag}</li>
              ))}
            </ul>
          ) : null}
          {project.href ? (
            <a
              href={project.href}
              target="_blank"
              rel="noreferrer"
              className="project-link"
            >
              {linkLabel}
            </a>
          ) : null}
        </div>
      </div>
    </div>
  );
}
