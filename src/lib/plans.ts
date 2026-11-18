import type { Plan } from "@prisma/client";
import { asLimits, asStringArray } from "./format";
import type { PricingPlan } from "@/components/sections/PricingTable";

export function toPricingPlan(p: Plan): PricingPlan {
  return {
    id: p.id, name: p.name, description: p.description, monthlyCents: p.monthlyCents, yearlyCents: p.yearlyCents,
    currency: p.currency, isCustom: p.isCustom, highlighted: p.highlighted, features: asStringArray(p.features),
    limits: asLimits(p.limits), productAccess: p.productAccess, supportLevel: p.supportLevel, ctaLabel: p.ctaLabel,
  };
}
