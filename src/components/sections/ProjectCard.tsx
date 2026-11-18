import Image from "next/image";
import Link from "next/link";
import type { Project } from "@prisma/client";
import { StatusBadge, Pill } from "../ui/Badge";
import { TiltCard } from "../ui/TiltCard";
import { asStringArray } from "@/lib/format";

export function ProjectCard({ project }: { project: Project }) {
  const tags = asStringArray(project.tags);
  return (
    <TiltCard glow={project.accentColor} className="group rounded-[1.25rem]" max={6}>
      <Link href={`/projects/${project.slug}`} className="glass flex h-full flex-col overflow-hidden rounded-[1.25rem] transition-colors hover:border-white/25">
        <div className="relative aspect-[16/9] overflow-hidden">
          {project.imageUrl ? (
            <Image src={project.imageUrl} alt={project.title} fill sizes="(min-width:1024px) 33vw, 100vw" className="object-cover transition-transform duration-700 group-hover:scale-105" />
          ) : (
            <div aria-hidden="true" className="absolute inset-0" style={{ background: `radial-gradient(circle at 30% 20%, ${project.accentColor}55, transparent 55%), radial-gradient(circle at 80% 90%, #625BFF44, transparent 50%), #0a1124` }}>
              <div className="grid-lines absolute inset-0" />
              <div className="absolute inset-0 grid place-items-center">
                <div className="size-20 rotate-45 rounded-2xl border transition-transform duration-700 group-hover:rotate-[135deg]" style={{ borderColor: `${project.accentColor}aa`, boxShadow: `0 0 40px ${project.accentColor}55` }} />
              </div>
            </div>
          )}
          <StatusBadge status={project.status} kind="project" className="absolute top-3 left-3 bg-bg/70 backdrop-blur" />
        </div>
        <div className="flex flex-1 flex-col p-5">
          {project.category && <p className="text-xs font-medium tracking-wide text-muted uppercase">{project.category}</p>}
          <h3 className="mt-1 font-display text-lg font-semibold">{project.title}</h3>
          <p className="mt-2 flex-1 text-sm text-text-2">{project.summary}</p>
          {tags.length > 0 && <div className="mt-4 flex flex-wrap gap-1.5">{tags.map((t) => <Pill key={t}>{t}</Pill>)}</div>}
        </div>
      </Link>
    </TiltCard>
  );
}
