"use client";
import { useState } from "react";
import Link from "next/link";
import clsx from "clsx";
import { Icon } from "../ui/Icon";
import { PricingTable, type PricingPlan } from "./PricingTable";

type Item = { id: string; slug: string; name: string; icon: string; accentColor: string; available: boolean; plans: PricingPlan[] };

export function ProductPlans({ items }: { items: Item[] }) {
  const [active, setActive] = useState(items[0]?.id);
  const current = items.find((i) => i.id === active) ?? items[0];
  if (!current) return null;
  return (
    <div>
      <div role="tablist" aria-label="Choose a product" className="flex gap-2 overflow-x-auto pb-2">
        {items.map((i) => (
          <button
            key={i.id}
            type="button"
            role="tab"
            aria-selected={i.id === current.id}
            onClick={() => setActive(i.id)}
            className={clsx("flex min-h-11 shrink-0 items-center gap-2 rounded-full border px-4 text-sm font-medium transition-colors", i.id === current.id ? "border-cyan/50 bg-cyan/10 text-text" : "border-white/10 text-text-2 hover:border-white/25 hover:text-text")}
          >
            <Icon name={i.icon} className="size-4" style={{ color: i.accentColor }} />
            {i.name.replace(/^PowerPulse\s+/, "")}
          </button>
        ))}
      </div>
      <div role="tabpanel" className="mt-8">
        <p className="mb-8 text-center text-sm text-text-2">
          Plans for <Link href={`/software/${current.slug}`} className="font-semibold text-text underline-offset-4 hover:underline">{current.name}</Link> only.
          {!current.available && <span className="text-warning"> This product is not yet available. Prices are indicative.</span>}
        </p>
        <PricingTable key={current.id} plans={current.plans} productSlug={current.slug} />
      </div>
    </div>
  );
}
