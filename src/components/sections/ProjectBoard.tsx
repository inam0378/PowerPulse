"use client";
import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import clsx from "clsx";
import type { Project } from "@prisma/client";
import { ProjectCard } from "./ProjectCard";
import { projectStatusLabel } from "@/lib/format";

export function ProjectBoard({ projects }: { projects: Project[] }) {
  const [status, setStatus] = useState("all");
  const [category, setCategory] = useState("all");
  const categories = useMemo(() => Array.from(new Set(projects.map((p) => p.category).filter(Boolean))), [projects]);
  const statuses = ["COMPLETED", "IN_PROGRESS", "UPCOMING", "DEMO"].filter((s) => projects.some((p) => p.status === s));
  const list = projects.filter((p) => (status === "all" || p.status === status) && (category === "all" || p.category === category));

  const chip = (active: boolean) => clsx("min-h-10 shrink-0 rounded-full border px-4 text-sm font-medium transition-colors", active ? "border-cyan/50 bg-cyan/10 text-text" : "border-white/10 text-text-2 hover:border-white/25 hover:text-text");

  return (
    <div>
      <div className="flex flex-col gap-3">
        <div className="flex gap-2 overflow-x-auto pb-1" role="group" aria-label="Filter by status">
          <button type="button" aria-pressed={status === "all"} className={chip(status === "all")} onClick={() => setStatus("all")}>All projects</button>
          {statuses.map((s) => (
            <button key={s} type="button" aria-pressed={status === s} className={chip(status === s)} onClick={() => setStatus(s)}>
              {projectStatusLabel[s]} <span className="text-muted">{projects.filter((p) => p.status === s).length}</span>
            </button>
          ))}
        </div>
        {categories.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-1" role="group" aria-label="Filter by category">
            <button type="button" aria-pressed={category === "all"} className={chip(category === "all")} onClick={() => setCategory("all")}>All categories</button>
            {categories.map((c) => <button key={c} type="button" aria-pressed={category === c} className={chip(category === c)} onClick={() => setCategory(c)}>{c}</button>)}
          </div>
        )}
      </div>
      <p className="mt-6 text-sm text-text-2" aria-live="polite">{list.length} {list.length === 1 ? "project" : "projects"}</p>
      <motion.div layout className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {list.map((p) => (
            <motion.div key={p.id} layout initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96, transition: { duration: 0.15 } }}>
              <ProjectCard project={p} />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
      {list.length === 0 && <p className="glass mt-4 rounded-2xl p-10 text-center text-text-2">No projects in this view yet.</p>}
    </div>
  );
}
