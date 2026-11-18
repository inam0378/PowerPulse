import type { Metadata } from "next";
import { ProjectBoard } from "@/components/sections/ProjectBoard";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { getPublishedProjects } from "@/lib/data";

export const metadata: Metadata = {
  title: "Projects",
  description: "Completed, in-development, upcoming and demo projects built on the PowerPulse software ecosystem.",
  alternates: { canonical: "/projects" },
};

export default async function ProjectsPage() {
  const projects = await getPublishedProjects();
  return (
    <div className="container-pp pt-32 pb-12">
      <SectionHeading as="h1" eyebrow="Portfolio" title={<>Projects across the <span className="text-gradient">ecosystem</span></>} body="Completed rollouts, work in progress and what's coming next." />
      <div className="mt-14"><ProjectBoard projects={projects} /></div>
    </div>
  );
}
