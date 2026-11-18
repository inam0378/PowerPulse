import type { Metadata } from "next";
import Link from "next/link";
import { ExternalLink, LogOut } from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { logout } from "@/app/actions/auth";
import { AdminNav } from "@/components/admin/AdminNav";
import { LogoMark } from "@/components/layout/Logo";

export const metadata: Metadata = { title: { default: "Admin", template: "%s · Admin | PowerPulse" }, robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await requireAdmin();
  const unread = await prisma.inquiry.count({ where: { handled: false } });
  return (
    <div className="min-h-screen bg-bg lg:grid lg:grid-cols-[260px_1fr]">
      <aside className="border-b border-white/10 bg-bg-2 p-4 lg:sticky lg:top-0 lg:h-screen lg:border-r lg:border-b-0">
        <div className="flex items-center justify-between lg:block">
          <Link href="/admin" className="flex items-center gap-2.5"><LogoMark /><span className="font-display font-semibold">PowerPulse <span className="text-muted">Admin</span></span></Link>
          <Link href="/" target="_blank" className="inline-flex min-h-10 items-center gap-1.5 text-sm text-text-2 hover:text-text lg:mt-4">View site <ExternalLink className="size-3.5" aria-hidden="true" /></Link>
        </div>
        <div className="mt-4 lg:mt-6"><AdminNav unread={unread} /></div>
        <div className="mt-4 hidden border-t border-white/10 pt-4 lg:absolute lg:inset-x-4 lg:bottom-4 lg:block">
          <p className="truncate text-sm font-medium">{session.name}</p>
          <p className="truncate text-xs text-muted">{session.email}</p>
          <form action={logout}><button type="submit" className="mt-3 inline-flex min-h-10 items-center gap-2 text-sm text-text-2 hover:text-text"><LogOut className="size-4" aria-hidden="true" />Sign out</button></form>
        </div>
      </aside>
      <main id="main" className="min-w-0 p-4 sm:p-6 lg:p-10">{children}</main>
    </div>
  );
}
