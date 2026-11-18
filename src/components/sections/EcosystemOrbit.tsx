import Link from "next/link";
import { Icon } from "../ui/Icon";
import { LogoMark } from "../layout/Logo";
import type { ProductCard } from "@/lib/data";

/** Products arranged around the PowerPulse core: the ecosystem at a glance. */
export function EcosystemOrbit({ products }: { products: ProductCard[] }) {
  const items = products.slice(0, 10);
  return (
    <div className="relative mx-auto aspect-square w-full max-w-[520px]" data-reveal>
      <div aria-hidden="true" className="absolute inset-[6%] rounded-full border border-white/10" />
      <div aria-hidden="true" className="absolute inset-[22%] rounded-full border border-dashed border-cyan/20 motion-safe:animate-[spin_60s_linear_infinite]" />
      <div aria-hidden="true" className="absolute inset-[34%] rounded-full bg-blue/20 blur-3xl" />
      <div className="absolute inset-[36%] grid place-items-center rounded-full border border-cyan/40 bg-surface shadow-[0_0_80px_-10px_rgba(0,212,255,0.6)]">
        <LogoMark className="size-1/2" />
        <span className="absolute inset-0 animate-pulse-ring rounded-full border border-cyan/40" aria-hidden="true" />
      </div>
      <ul>
        {items.map((p, i) => {
          const a = (i / items.length) * Math.PI * 2 - Math.PI / 2;
          const r = 44;
          return (
            <li key={p.id} className="absolute -translate-x-1/2 -translate-y-1/2" style={{ left: `${50 + Math.cos(a) * r}%`, top: `${50 + Math.sin(a) * r}%` }}>
              <Link href={`/software/${p.slug}`} className="group flex flex-col items-center gap-1.5" aria-label={p.name}>
                <span className="grid size-12 place-items-center rounded-2xl border border-white/10 bg-surface transition-all duration-300 group-hover:-translate-y-1 group-hover:border-white/30 sm:size-14" style={{ color: p.accentColor, boxShadow: `0 10px 30px -10px ${p.accentColor}88` }}>
                  <Icon name={p.icon} className="size-5 sm:size-6" />
                </span>
                <span className="hidden max-w-24 text-center text-[11px] leading-tight text-text-2 sm:block">{p.name.replace(/^PowerPulse\s+/, "")}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
