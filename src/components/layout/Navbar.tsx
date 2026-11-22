"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import clsx from "clsx";
import { Logo } from "./Logo";
import { ButtonLink } from "../ui/Button";
import { Magnetic } from "../ui/Magnetic";

const links = [
  { href: "/software", label: "Software" },
  { href: "/projects", label: "Projects" },
  { href: "/pricing", label: "Pricing" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];
// RestoPulse Tablet is a static offline app (public/restopulse-tablet), so it gets a plain link, not a Next route.
const TABLET = { href: "/restopulse-tablet/index.html", label: "Tablet App" };

export function Navbar({ signedIn, isAdmin }: { signedIn: boolean; isAdmin: boolean }) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 12);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);
  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");
  const account = isAdmin ? { href: "/admin", label: "Dashboard" } : signedIn ? { href: "/account", label: "Account" } : { href: "/login", label: "Sign in" };

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-4">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-surface focus:px-4 focus:py-2">Skip to content</a>
      <nav
        aria-label="Main"
        className={clsx(
          "mx-auto flex max-w-7xl items-center justify-between rounded-2xl px-4 transition-all duration-300 ease-out sm:px-5",
          scrolled || open ? "glass h-14 shadow-[0_10px_40px_-15px_rgba(0,0,0,0.8)]" : "h-16 border border-transparent",
        )}
      >
        <Logo />
        <ul className="hidden items-center gap-1 lg:flex">
          {links.map((l) => (
            <li key={l.href}>
              <Link
                href={l.href}
                aria-current={isActive(l.href) ? "page" : undefined}
                className={clsx("relative rounded-full px-4 py-2 text-sm font-medium transition-colors", isActive(l.href) ? "text-text" : "text-text-2 hover:text-text")}
              >
                {isActive(l.href) && (
                  <motion.span layoutId="nav-pill" className="absolute inset-0 -z-10 rounded-full bg-white/[0.08] ring-1 ring-white/10" transition={{ type: "spring", stiffness: 380, damping: 32 }} />
                )}
                {l.label}
              </Link>
            </li>
          ))}
          <li>
            <a href={TABLET.href} className="relative inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium text-text-2 transition-colors hover:text-text">
              {TABLET.label}<span className="rounded bg-[#ffc800] px-1.5 py-px text-[10px] font-bold leading-4 text-[#0c0b09]">OFFLINE</span>
            </a>
          </li>
        </ul>
        <div className="hidden items-center gap-2 lg:flex">
          <Link href={account.href} className="rounded-full px-4 py-2 text-sm font-medium text-text-2 transition-colors hover:text-text">{account.label}</Link>
          <Magnetic><ButtonLink href="/pricing" size="sm">Get started</ButtonLink></Magnetic>
        </div>
        <button
          type="button"
          className="grid size-11 place-items-center rounded-xl text-text lg:hidden"
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="size-6" /> : <Menu className="size-6" />}
        </button>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-menu"
            initial={{ opacity: 0, y: -12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98, transition: { duration: 0.15 } }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="glass mx-auto mt-2 max-w-7xl rounded-2xl p-3 lg:hidden"
          >
            <ul className="flex flex-col">
              {links.map((l, i) => (
                <motion.li key={l.href} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.03 * i }}>
                  <Link href={l.href} aria-current={isActive(l.href) ? "page" : undefined} className={clsx("flex min-h-12 items-center rounded-xl px-4 text-base font-medium", isActive(l.href) ? "bg-white/[0.08] text-text" : "text-text-2")}>
                    {l.label}
                  </Link>
                </motion.li>
              ))}
              <li>
                <a href={TABLET.href} className="flex min-h-12 items-center gap-2 rounded-xl px-4 text-base font-medium text-text-2">
                  {TABLET.label}<span className="rounded bg-[#ffc800] px-1.5 py-px text-[10px] font-bold leading-4 text-[#0c0b09]">OFFLINE</span>
                </a>
              </li>
            </ul>
            <div className="mt-3 grid grid-cols-2 gap-2 border-t border-white/10 pt-3">
              <ButtonLink href={account.href} variant="secondary">{account.label}</ButtonLink>
              <ButtonLink href="/pricing">Get started</ButtonLink>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
