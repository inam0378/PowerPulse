import type { MetadataRoute } from "next";
import { prisma } from "@/lib/db";
import { PUBLIC_STATUSES } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const [products, projects] = await Promise.all([
    prisma.product.findMany({ where: { status: { in: [...PUBLIC_STATUSES] } }, select: { slug: true, updatedAt: true } }),
    prisma.project.findMany({ where: { published: true }, select: { slug: true, updatedAt: true } }),
  ]);
  const pages = ["", "/software", "/projects", "/pricing", "/about", "/contact"].map((p) => ({
    url: `${base}${p}`, changeFrequency: "weekly" as const, priority: p === "" ? 1 : 0.8,
  }));
  return [
    ...pages,
    ...products.map((p) => ({ url: `${base}/software/${p.slug}`, lastModified: p.updatedAt, priority: 0.7 })),
    ...projects.map((p) => ({ url: `${base}/projects/${p.slug}`, lastModified: p.updatedAt, priority: 0.5 })),
  ];
}
