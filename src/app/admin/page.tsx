import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { prisma } from "@/lib/db";
import { StatusBadge } from "@/components/ui/Badge";

export default async function AdminHome() {
  const [products, byStatus, plans, projects, inquiries, users, recent] = await Promise.all([
    prisma.product.count(),
    prisma.product.groupBy({ by: ["status"], _count: true }),
    prisma.plan.count({ where: { active: true } }),
    prisma.project.count(),
    prisma.inquiry.count({ where: { handled: false } }),
    prisma.user.count({ where: { role: "CUSTOMER" } }),
    prisma.inquiry.findMany({ orderBy: { createdAt: "desc" }, take: 6, include: { product: { select: { name: true } } } }),
  ]);
  const cards = [
    { label: "Products", value: products, href: "/admin/products" },
    { label: "Active plans", value: plans, href: "/admin/plans" },
    { label: "Projects", value: projects, href: "/admin/projects" },
    { label: "Open inquiries", value: inquiries, href: "/admin/inquiries" },
    { label: "Customer accounts", value: users, href: "/admin/users" },
  ];
  return (
    <div>
      <h1 className="font-display text-3xl font-semibold">Overview</h1>
      <p className="mt-1 text-text-2">Manage everything visitors see on the PowerPulse website.</p>
      <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-5">
        {cards.map((c) => (
          <Link key={c.label} href={c.href} className="glass rounded-2xl p-5 transition-colors hover:border-white/25">
            <p className="text-sm text-text-2">{c.label}</p>
            <p className="mt-2 font-display text-3xl font-semibold tabular-nums">{c.value}</p>
          </Link>
        ))}
      </div>
      <div className="mt-8 grid gap-6 xl:grid-cols-[1fr_1.4fr]">
        <section className="glass rounded-2xl p-6">
          <h2 className="font-display text-lg font-semibold">Products by status</h2>
          <ul className="mt-4 space-y-3">
            {byStatus.map((s) => (
              <li key={s.status} className="flex items-center justify-between"><StatusBadge status={s.status} /><span className="tabular-nums text-text-2">{s._count}</span></li>
            ))}
          </ul>
        </section>
        <section className="glass rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold">Latest inquiries</h2>
            <Link href="/admin/inquiries" className="inline-flex items-center gap-1 text-sm text-cyan">All <ArrowRight className="size-4" aria-hidden="true" /></Link>
          </div>
          {recent.length === 0 ? <p className="mt-4 text-sm text-text-2">No inquiries yet.</p> : (
            <ul className="mt-4 divide-y divide-white/10">
              {recent.map((r) => (
                <li key={r.id} className="flex items-center justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <p className="truncate font-medium">{r.name} <span className="text-sm font-normal text-muted">· {r.type.toLowerCase()}</span></p>
                    <p className="truncate text-sm text-text-2">{r.product?.name ?? r.planName ?? r.email}</p>
                  </div>
                  {!r.handled && <span className="shrink-0 rounded-full bg-cyan/15 px-2 py-0.5 text-xs text-cyan">New</span>}
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
