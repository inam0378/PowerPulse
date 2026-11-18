import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { StatusBadge, Pill } from "@/components/ui/Badge";
import { CtaBand } from "@/components/sections/CtaBand";
import { getProjectBySlug, getSettings } from "@/lib/data";
import { asStringArray } from "@/lib/format";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const p = await getProjectBySlug((await params).slug);
  if (!p) notFound();
  return { title: p.title, description: p.summary, alternates: { canonical: `/projects/${p.slug}` } };
}

export default async function ProjectPage({ params }: Props) {
  const project = await getProjectBySlug((await params).slug);
  if (!project) notFound();
  const settings = await getSettings();
  const tags = asStringArray(project.tags);
  return (
    <>
      <article className="container-pp max-w-4xl pt-32">
        <Link href="/projects" className="inline-flex min-h-10 items-center gap-2 text-sm text-text-2 hover:text-text"><ArrowLeft className="size-4" aria-hidden="true" /> All projects</Link>
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <StatusBadge status={project.status} kind="project" />
          {project.category && <span className="text-sm text-text-2">{project.category}</span>}
        </div>
        <h1 className="mt-4 font-display text-4xl font-semibold sm:text-5xl">{project.title}</h1>
        <p className="mt-4 text-xl text-text-2">{project.summary}</p>
        <div className="relative mt-10 aspect-[16/8] overflow-hidden rounded-2xl border border-white/10">
          {project.imageUrl ? (
            <Image src={project.imageUrl} alt={project.title} fill priority sizes="(min-width:1024px) 900px, 100vw" className="object-cover" />
          ) : (
            <div aria-hidden="true" className="absolute inset-0" style={{ background: `radial-gradient(circle at 30% 30%, ${project.accentColor}66, transparent 55%), radial-gradient(circle at 80% 80%, #625BFF55, transparent 50%), #0a1124` }}><div className="grid-lines absolute inset-0" /></div>
          )}
        </div>
        <div className="mt-10 text-lg whitespace-pre-line text-text-2">{project.description}</div>
        {tags.length > 0 && <div className="mt-8 flex flex-wrap gap-2">{tags.map((t) => <Pill key={t}>{t}</Pill>)}</div>}
      </article>
      <CtaBand {...settings.cta} />
    </>
  );
}
