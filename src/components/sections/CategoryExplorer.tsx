"use client";
import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import clsx from "clsx";
import { Icon } from "../ui/Icon";
import { StatusBadge } from "../ui/Badge";

type Cat = { id: string; name: string; slug: string; description: string; icon: string; products: { slug: string; name: string; shortDescription: string; icon: string; accentColor: string; status: string }[] };

export function CategoryExplorer({ categories }: { categories: Cat[] }) {
  const list = categories.filter((c) => c.products.length > 0);
  const [active, setActive] = useState(list[0]?.id);
  const current = list.find((c) => c.id === active) ?? list[0];
  if (!current) return null;
  return (
    <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
      <div role="tablist" aria-label="Product categories" className="flex gap-2 overflow-x-auto pb-2 lg:flex-col lg:overflow-visible lg:pb-0">
        {list.map((c) => (
          <button
            key={c.id}
            role="tab"
            type="button"
            id={`tab-${c.id}`}
            aria-selected={c.id === current.id}
            aria-controls="category-panel"
            onClick={() => setActive(c.id)}
            className={clsx(
              "relative flex min-h-12 shrink-0 items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium transition-colors",
              c.id === current.id ? "text-text" : "text-text-2 hover:bg-white/[0.04] hover:text-text",
            )}
          >
            {c.id === current.id && <motion.span layoutId="cat-pill" className="absolute inset-0 -z-10 rounded-xl border border-cyan/30 bg-gradient-to-r from-blue/20 to-transparent" transition={{ type: "spring", stiffness: 380, damping: 34 }} />}
            <Icon name={c.icon} className={clsx("size-5 shrink-0", c.id === current.id ? "text-cyan" : "text-muted")} />
            <span className="whitespace-nowrap lg:whitespace-normal">{c.name}</span>
            <span className="ml-auto hidden text-xs text-muted lg:inline">{c.products.length}</span>
          </button>
        ))}
      </div>
      <div id="category-panel" role="tabpanel" aria-labelledby={`tab-${current.id}`} className="glass min-h-[280px] rounded-[1.25rem] p-6">
        <AnimatePresence mode="wait">
          <motion.div key={current.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}>
            <h3 className="font-display text-2xl font-semibold">{current.name}</h3>
            {current.description && <p className="mt-2 text-text-2">{current.description}</p>}
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {current.products.map((p) => (
                <Link key={p.slug} href={`/software/${p.slug}`} className="group flex gap-4 rounded-xl border border-white/10 bg-white/[0.02] p-4 transition-colors hover:border-white/25 hover:bg-white/[0.05]">
                  <span className="grid size-11 shrink-0 place-items-center rounded-xl" style={{ background: `${p.accentColor}1f`, color: p.accentColor }}><Icon name={p.icon} className="size-5" /></span>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2"><p className="font-semibold">{p.name}</p><StatusBadge status={p.status} /></div>
                    <p className="mt-1 line-clamp-2 text-sm text-text-2">{p.shortDescription}</p>
                  </div>
                  <ArrowUpRight className="ml-auto size-4 shrink-0 text-muted transition-colors group-hover:text-cyan" aria-hidden="true" />
                </Link>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
