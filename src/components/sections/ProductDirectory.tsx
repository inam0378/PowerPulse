"use client";
import { useMemo, useState, useDeferredValue } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { LayoutGrid, List, Search, X } from "lucide-react";
import clsx from "clsx";
import type { ProductCard as P } from "@/lib/data";
import { ProductCard } from "./ProductCard";
import { productStatusLabel } from "@/lib/format";

type Cat = { slug: string; name: string; count: number };

export function ProductDirectory({ products, categories, initialCategory }: { products: P[]; categories: Cat[]; initialCategory?: string }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState(initialCategory ?? "all");
  const [status, setStatus] = useState("all");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [sort, setSort] = useState<"featured" | "new" | "az">("featured");
  const q = useDeferredValue(query.trim().toLowerCase());

  const statuses = useMemo(() => Array.from(new Set(products.map((p) => p.status))), [products]);

  const filtered = useMemo(() => {
    let list = products.filter((p) => {
      if (category !== "all" && p.category?.slug !== category) return false;
      if (status !== "all" && p.status !== status) return false;
      if (!q) return true;
      return [p.name, p.tagline, p.shortDescription, p.category?.name ?? ""].some((s) => s.toLowerCase().includes(q));
    });
    if (sort === "featured") list = [...list].sort((a, b) => Number(b.featured) - Number(a.featured));
    if (sort === "new") list = [...list].sort((a, b) => Number(b.isNew) - Number(a.isNew));
    if (sort === "az") list = [...list].sort((a, b) => a.name.localeCompare(b.name));
    return list;
  }, [products, category, status, q, sort]);

  const updateCategory = (slug: string) => {
    setCategory(slug);
    const url = new URL(window.location.href);
    if (slug === "all") url.searchParams.delete("category"); else url.searchParams.set("category", slug);
    window.history.replaceState(null, "", url);
  };

  return (
    <div>
      <div className="glass sticky top-20 z-30 rounded-2xl p-3 sm:p-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <label className="relative flex-1">
            <span className="sr-only">Search software</span>
            <Search className="pointer-events-none absolute top-1/2 left-3.5 size-5 -translate-y-1/2 text-muted" aria-hidden="true" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search products, features or industries"
              className="field min-h-11 pl-11"
            />
            {query && (
              <button type="button" onClick={() => setQuery("")} aria-label="Clear search" className="absolute top-1/2 right-2 grid size-8 -translate-y-1/2 place-items-center rounded-lg text-muted hover:text-text">
                <X className="size-4" />
              </button>
            )}
          </label>
          <div className="flex gap-2">
            <label className="flex-1 md:w-44 md:flex-none">
              <span className="sr-only">Filter by status</span>
              <select value={status} onChange={(e) => setStatus(e.target.value)} className="field min-h-11">
                <option value="all">All statuses</option>
                {statuses.map((s) => <option key={s} value={s}>{productStatusLabel[s]}</option>)}
              </select>
            </label>
            <label className="flex-1 md:w-40 md:flex-none">
              <span className="sr-only">Sort</span>
              <select value={sort} onChange={(e) => setSort(e.target.value as typeof sort)} className="field min-h-11">
                <option value="featured">Featured first</option>
                <option value="new">New releases</option>
                <option value="az">Name A–Z</option>
              </select>
            </label>
            <div role="group" aria-label="Layout" className="flex rounded-xl border border-glass-border p-1">
              {(["grid", "list"] as const).map((v) => (
                <button key={v} type="button" aria-pressed={view === v} aria-label={`${v} view`} onClick={() => setView(v)} className={clsx("grid size-9 place-items-center rounded-lg transition-colors", view === v ? "bg-white/10 text-text" : "text-muted hover:text-text")}>
                  {v === "grid" ? <LayoutGrid className="size-4" /> : <List className="size-4" />}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1" role="group" aria-label="Filter by category">
          {[{ slug: "all", name: "All", count: products.length }, ...categories].map((c) => (
            <button
              key={c.slug}
              type="button"
              aria-pressed={category === c.slug}
              onClick={() => updateCategory(c.slug)}
              className={clsx("min-h-10 shrink-0 rounded-full border px-4 text-sm font-medium transition-colors", category === c.slug ? "border-cyan/50 bg-cyan/10 text-text" : "border-white/10 text-text-2 hover:border-white/25 hover:text-text")}
            >
              {c.name} <span className="text-muted">{c.count}</span>
            </button>
          ))}
        </div>
      </div>

      <p className="mt-6 text-sm text-text-2" aria-live="polite">{filtered.length} {filtered.length === 1 ? "product" : "products"}</p>

      {filtered.length === 0 ? (
        <div className="glass mt-4 rounded-2xl p-12 text-center">
          <p className="font-display text-xl font-semibold">No products match</p>
          <p className="mt-2 text-text-2">Try a different search or clear the filters.</p>
          <button type="button" onClick={() => { setQuery(""); updateCategory("all"); setStatus("all"); }} className="mt-5 text-sm font-semibold text-cyan">Clear filters</button>
        </div>
      ) : (
        <motion.div layout className={clsx("mt-4", view === "grid" ? "grid gap-5 sm:grid-cols-2 lg:grid-cols-3" : "flex flex-col gap-3")}>
          <AnimatePresence mode="popLayout">
            {filtered.map((p, i) => (
              <motion.div key={p.id} layout initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.96, transition: { duration: 0.15 } }} transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}>
                <ProductCard product={p} index={i} layout={view} />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}
