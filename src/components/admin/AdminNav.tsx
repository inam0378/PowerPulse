"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { FolderKanban, HelpCircle, Inbox, KeyRound, LayoutDashboard, Package, Quote, Settings, Tags, Users, Wallet } from "lucide-react";

const items = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/categories", label: "Categories", icon: Tags },
  { href: "/admin/plans", label: "Pricing plans", icon: Wallet },
  { href: "/admin/projects", label: "Projects", icon: FolderKanban },
  { href: "/admin/testimonials", label: "Testimonials", icon: Quote },
  { href: "/admin/faqs", label: "FAQs", icon: HelpCircle },
  { href: "/admin/inquiries", label: "Inquiries", icon: Inbox },
  { href: "/admin/licenses", label: "RestoPulse licenses", icon: KeyRound },
  { href: "/admin/settings", label: "Site content", icon: Settings },
  { href: "/admin/users", label: "Users", icon: Users },
];

export function AdminNav({ unread }: { unread: number }) {
  const pathname = usePathname();
  const active = (href: string) => (href === "/admin" ? pathname === href : pathname.startsWith(href));
  return (
    <nav aria-label="Admin" className="flex gap-1 overflow-x-auto lg:flex-col lg:overflow-visible">
      {items.map(({ href, label, icon: I }) => (
        <Link
          key={href}
          href={href}
          aria-current={active(href) ? "page" : undefined}
          className={clsx("flex min-h-11 shrink-0 items-center gap-3 rounded-xl px-3 text-sm font-medium transition-colors", active(href) ? "bg-white/[0.08] text-text ring-1 ring-white/10" : "text-text-2 hover:bg-white/[0.04] hover:text-text")}
        >
          <I className={clsx("size-4.5", active(href) && "text-cyan")} aria-hidden="true" />
          {label}
          {href === "/admin/inquiries" && unread > 0 && <span className="ml-auto rounded-full bg-cyan px-2 py-0.5 text-xs font-semibold text-bg">{unread}</span>}
        </Link>
      ))}
    </nav>
  );
}
