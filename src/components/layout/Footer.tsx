import Link from "next/link";
import { LogoMark } from "./Logo";
import type { SiteContent } from "@/lib/site-defaults";

type P = { slug: string; name: string };

export function Footer({ settings, products }: { settings: SiteContent; products: P[] }) {
  const year = new Date().getFullYear();
  const cols = [
    { title: "Software", links: [...products.slice(0, 5).map((p) => ({ href: `/software/${p.slug}`, label: p.name.replace(/^PowerPulse\s+/, "") })), { href: "/software", label: "All software →" }] },
    { title: "Company", links: [{ href: "/about", label: "About" }, { href: "/projects", label: "Projects" }, { href: "/pricing", label: "Pricing" }, { href: "/contact", label: "Contact" }] },
    { title: "Get in touch", links: [{ href: "/contact?type=SALES", label: "Sales" }, { href: "/contact?type=PARTNERSHIP", label: "Partnerships" }, { href: "/contact?type=SUPPORT", label: "Support" }, { href: `mailto:${settings.contact.email}`, label: settings.contact.email }] },
  ];
  return (
    <footer className="relative mt-24 border-t border-white/[0.07] bg-bg-2">
      <div aria-hidden="true" className="absolute inset-x-0 -top-px mx-auto h-px max-w-3xl bg-gradient-to-r from-transparent via-cyan/60 to-transparent" />
      <div className="container-pp grid gap-12 py-16 md:grid-cols-[1.4fr_repeat(3,1fr)]">
        <div>
          <div className="flex items-center gap-2.5">
            <LogoMark />
            <span className="font-display text-lg font-semibold">{settings.brand.name}</span>
          </div>
          <p className="mt-4 max-w-xs text-sm text-text-2">{settings.brand.supportingTagline}</p>
          <ul className="mt-6 flex flex-wrap gap-2">
            {settings.socials.map((s) => (
              <li key={s.label}>
                <a href={s.url} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-10 items-center rounded-full border border-white/10 px-4 text-sm text-text-2 transition-colors hover:border-white/25 hover:text-text">
                  {s.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
        {cols.map((c) => (
          <div key={c.title}>
            <h2 className="font-display text-sm font-semibold text-text">{c.title}</h2>
            <ul className="mt-4 space-y-1">
              {c.links.map((l) => (
                <li key={l.href + l.label}>
                  <Link href={l.href} className="inline-block py-1.5 text-sm break-all text-text-2 transition-colors hover:text-text">{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-white/[0.06]">
        <div className="container-pp flex flex-col gap-2 py-6 text-sm text-muted sm:flex-row sm:items-center sm:justify-between">
          <p>© {year} {settings.brand.name}. All rights reserved.</p>
          <p>{settings.brand.tagline}</p>
        </div>
      </div>
    </footer>
  );
}
