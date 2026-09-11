"use client";

import { Motif } from "@/components/motifs";
import { TiltCard } from "@/components/motion/tilt-card";
import { Superellipse } from "@/components/superellipse";
import Link from "next/link";
import Image from "next/image";
import type { Project } from "@/data/projects";
import { cn } from "@/lib/utils";

export function GlowFill({
  glow,
  motif,
  title,
  image,
  sizes = "(max-width: 960px) 50vw, 220px",
  className,
}: {
  glow: [string, string];
  motif: Project["motif"];
  title?: string;
  image?: string;
  sizes?: string;
  className?: string;
}) {
  const [a, b] = glow;
  return (
    <Superellipse className={cn("glow-tile", className)}>
      {image ? (
        <Image src={image} alt="" fill sizes={sizes} className="object-cover" />
      ) : (
        <div
          className="absolute inset-0"
          style={{
            background: `
            radial-gradient(80% 70% at 50% 42%, ${b} 0%, transparent 52%),
            radial-gradient(120% 90% at 50% 50%, transparent 28%, ${a} 100%),
            radial-gradient(60% 50% at 78% 18%, ${a} 0%, transparent 55%),
            #09090c
          `,
          }}
        />
      )}
      {image ? <div className="cover-shade" /> : <Motif type={motif} />}
      <div className="glow-rim" />
      <div className="glow-grain" />
      {title ? (
        <div className="absolute inset-0 flex flex-col items-center justify-end px-3 pb-3 text-center">
          <span className="cover-title">{title}</span>
        </div>
      ) : null}
    </Superellipse>
  );
}

export function ProjectCover({ project }: { project: Project }) {
  return (
    <Link
      href={`/work/${project.slug}`}
      className="group relative block aspect-square"
      aria-label={project.title}
    >
      <TiltCard className="absolute inset-0">
        <GlowFill
          glow={project.glow}
          motif={project.motif}
          image={project.cover}
          title={project.title}
          className="h-full transition-[filter,transform] duration-500 group-hover:brightness-110"
        />
      </TiltCard>
    </Link>
  );
}
