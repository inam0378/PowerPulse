"use client";
import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Check } from "lucide-react";
import clsx from "clsx";
import { annualSavings, formatPrice } from "@/lib/format";
import { buttonClass } from "../ui/Button";

export type PricingPlan = {
  id: string; name: string; description: string; monthlyCents: number | null; yearlyCents: number | null;
  currency: string; isCustom: boolean; highlighted: boolean; features: string[]; limits: { label: string; value: string }[];
  productAccess: string; supportLevel: string; ctaLabel: string;
};

export function BillingToggle({ yearly, onChange, maxSaving }: { yearly: boolean; onChange: (v: boolean) => void; maxSaving: number | null }) {
  return (
    <div className="flex flex-col items-center gap-3">
      <div role="radiogroup" aria-label="Billing frequency" className="glass relative inline-flex rounded-full p-1">
        {[{ v: false, l: "Monthly" }, { v: true, l: "Yearly" }].map((o) => (
          <button
            key={o.l}
            type="button"
            role="radio"
            aria-checked={yearly === o.v}
            onClick={() => onChange(o.v)}
            className={clsx("relative z-10 min-h-11 rounded-full px-6 text-sm font-semibold transition-colors", yearly === o.v ? "text-bg" : "text-text-2 hover:text-text")}
          >
            {yearly === o.v && <motion.span layoutId="billing-pill" className="bg-brand-gradient absolute inset-0 -z-10 rounded-full" transition={{ type: "spring", stiffness: 400, damping: 32 }} />}
            {o.l}
          </button>
        ))}
      </div>
      {maxSaving ? <p className="text-sm text-cyan">Save up to {maxSaving}% with yearly billing</p> : null}
    </div>
  );
}

function PlanPrice({ plan, yearly }: { plan: PricingPlan; yearly: boolean }) {
  if (plan.isCustom || (plan.monthlyCents == null && plan.yearlyCents == null)) {
    return <p className="font-display text-4xl font-semibold">Custom</p>;
  }
  const cents = yearly ? plan.yearlyCents : plan.monthlyCents;
  const saving = annualSavings(plan.monthlyCents, plan.yearlyCents);
  return (
    <div>
      <AnimatePresence mode="wait" initial={false}>
        <motion.p key={yearly ? "y" : "m"} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }} className="flex items-baseline gap-1">
          <span className="font-display text-4xl font-semibold tabular-nums">{cents != null ? formatPrice(cents, plan.currency) : "N/A"}</span>
          <span className="text-sm text-muted">/{yearly ? "year" : "month"}</span>
        </motion.p>
      </AnimatePresence>
      <p className="mt-1 h-5 text-xs text-text-2">
        {yearly && saving ? <>Billed yearly · <span className="text-success">save {formatPrice(saving.cents, plan.currency)} ({saving.percent}%)</span></> : yearly ? "Billed yearly" : "Billed monthly"}
      </p>
    </div>
  );
}

export function PricingCards({ plans, yearly, ctaBase = "/register", compact = false, productSlug }: { plans: PricingPlan[]; yearly: boolean; ctaBase?: string; compact?: boolean; productSlug?: string }) {
  if (!plans.length) return <p className="text-center text-text-2">Pricing for this product will be announced soon.</p>;
  return (
    <div className={clsx("grid gap-5", plans.length >= 4 ? "md:grid-cols-2 xl:grid-cols-4" : plans.length === 3 ? "md:grid-cols-3" : "md:grid-cols-2")}>
      {plans.map((plan) => {
        const href = plan.isCustom
          ? `/contact?type=SALES&plan=${encodeURIComponent(plan.name)}${productSlug ? `&product=${productSlug}` : ""}`
          : `${ctaBase}?plan=${encodeURIComponent(plan.name)}&billing=${yearly ? "yearly" : "monthly"}${productSlug ? `&product=${productSlug}` : ""}`;
        return (
          <div
            key={plan.id}
            data-reveal
            className={clsx(
              "relative flex flex-col rounded-[1.25rem] p-6",
              plan.highlighted ? "bg-gradient-to-b from-blue/25 via-surface to-surface ring-1 ring-cyan/50 shadow-[0_30px_80px_-30px_rgba(0,212,255,0.45)]" : "glass",
            )}
          >
            {plan.highlighted && <span className="bg-brand-gradient absolute -top-3 left-6 rounded-full px-3 py-1 text-xs font-semibold text-bg">Most popular</span>}
            <h3 className="font-display text-xl font-semibold">{plan.name}</h3>
            {plan.description && <p className="mt-1 min-h-10 text-sm text-text-2">{plan.description}</p>}
            <div className="mt-5"><PlanPrice plan={plan} yearly={yearly} /></div>
            {plan.productAccess && <p className="mt-4 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-xs text-text-2"><span className="text-muted">Access: </span>{plan.productAccess}</p>}
            <ul className="mt-5 flex-1 space-y-2.5">
              {(compact ? plan.features.slice(0, 4) : plan.features).map((f) => (
                <li key={f} className="flex gap-2.5 text-sm text-text-2"><Check className="mt-0.5 size-4 shrink-0 text-cyan" aria-hidden="true" />{f}</li>
              ))}
            </ul>
            {!compact && plan.supportLevel && <p className="mt-5 text-xs text-muted">Support: <span className="text-text-2">{plan.supportLevel}</span></p>}
            <Link href={href} className={buttonClass(plan.highlighted ? "primary" : "secondary", "md", "mt-6 w-full")}>{plan.ctaLabel}</Link>
          </div>
        );
      })}
    </div>
  );
}

export function PricingTable({ plans, compact, ctaBase, productSlug }: { plans: PricingPlan[]; compact?: boolean; ctaBase?: string; productSlug?: string }) {
  const [yearly, setYearly] = useState(false);
  const maxSaving = plans.reduce<number | null>((m, p) => {
    const s = annualSavings(p.monthlyCents, p.yearlyCents)?.percent ?? null;
    return s != null && (m == null || s > m) ? s : m;
  }, null);
  return (
    <div className="space-y-10">
      <BillingToggle yearly={yearly} onChange={setYearly} maxSaving={maxSaving} />
      <PricingCards plans={plans} yearly={yearly} compact={compact} ctaBase={ctaBase} productSlug={productSlug} />
    </div>
  );
}
