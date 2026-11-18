import "server-only";
import { cache } from "react";
import type { Prisma } from "@prisma/client";
import { prisma } from "./db";
import { siteDefaults, type SiteContent, type SiteKey } from "./site-defaults";

/** Statuses that appear on the public website. Draft and Archived stay hidden. */
export const PUBLIC_STATUSES = ["PUBLISHED", "IN_DEVELOPMENT", "COMING_SOON"] as const;

export const getSettings = cache(async (): Promise<SiteContent> => {
  const rows = await prisma.setting.findMany();
  const merged = structuredClone(siteDefaults) as SiteContent;
  for (const row of rows) {
    if (row.key in merged) {
      const key = row.key as SiteKey;
      const base = merged[key];
      const value = row.value as unknown;
      const isPlainObject = (v: unknown) => !!v && typeof v === "object" && !Array.isArray(v);
      // Objects are merged so new default fields still appear; lists and text are replaced.
      if (isPlainObject(base) && isPlainObject(value)) {
        (merged as Record<string, unknown>)[key] = { ...(base as object), ...(value as object) };
      } else if (typeof value === typeof base && Array.isArray(value) === Array.isArray(base)) {
        (merged as Record<string, unknown>)[key] = value;
      }
    }
  }
  return merged;
});

const productCard = {
  id: true, slug: true, name: true, tagline: true, shortDescription: true, icon: true, accentColor: true,
  status: true, featured: true, isNew: true, logoUrl: true, heroImageUrl: true, visualShape: true,
  category: { select: { name: true, slug: true } },
} satisfies Prisma.ProductSelect;

export type ProductCard = Prisma.ProductGetPayload<{ select: typeof productCard }>;

export const getPublicProducts = cache(async () =>
  prisma.product.findMany({
    where: { status: { in: [...PUBLIC_STATUSES] } },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    select: productCard,
  }),
);

export const getCategoriesWithCounts = cache(async () =>
  prisma.category.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    include: { _count: { select: { products: { where: { status: { in: [...PUBLIC_STATUSES] } } } } } },
  }),
);

export const getProductBySlug = cache(async (slug: string) =>
  prisma.product.findFirst({
    where: { slug, status: { in: [...PUBLIC_STATUSES] } },
    include: {
      category: true,
      plans: { where: { active: true }, orderBy: { sortOrder: "asc" } },
      faqs: { where: { published: true }, orderBy: { sortOrder: "asc" } },
    },
  }),
);

export const getEcosystemPlans = cache(async () =>
  prisma.plan.findMany({ where: { scope: "ECOSYSTEM", active: true }, orderBy: { sortOrder: "asc" } }),
);

export const getProductPlansOverview = cache(async () =>
  prisma.product.findMany({
    where: { status: { in: [...PUBLIC_STATUSES] }, plans: { some: { active: true } } },
    orderBy: { sortOrder: "asc" },
    select: {
      id: true, slug: true, name: true, icon: true, accentColor: true, status: true,
      plans: { where: { active: true }, orderBy: { sortOrder: "asc" } },
    },
  }),
);

export const getPublishedProjects = cache(async () =>
  prisma.project.findMany({ where: { published: true }, orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }] }),
);

export const getProjectBySlug = cache(async (slug: string) =>
  prisma.project.findFirst({ where: { slug, published: true } }),
);

export const getTestimonials = cache(async () =>
  prisma.testimonial.findMany({ where: { published: true }, orderBy: { sortOrder: "asc" } }),
);

export const getGeneralFaqs = cache(async () =>
  prisma.faq.findMany({ where: { published: true, productId: null }, orderBy: { sortOrder: "asc" } }),
);

export type PlanRow = Awaited<ReturnType<typeof getEcosystemPlans>>[number];
