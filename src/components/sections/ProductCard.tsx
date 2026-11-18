import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import clsx from "clsx";
import type { ProductCard as P } from "@/lib/data";
import { Icon } from "../ui/Icon";
import { StatusBadge, Pill } from "../ui/Badge";
import { TiltCard } from "../ui/TiltCard";
import { ProductVisual } from "../ui/ProductVisual";

export function ProductCard({ product, index = 0, layout = "grid" }: { product: P; index?: number; layout?: "grid" | "list" }) {
  const href = `/software/${product.slug}`;
  if (layout === "list") {
    return (
      <Link href={href} className="group glass flex flex-col gap-4 rounded-2xl p-4 transition-colors hover:border-white/25 sm:flex-row sm:items-center sm:p-5">
        <span className="grid size-12 shrink-0 place-items-center rounded-xl" style={{ background: `${product.accentColor}1f`, color: product.accentColor }}>
          <Icon name={product.icon} className="size-6" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-display text-lg font-semibold">{product.name}</h3>
            <StatusBadge status={product.status} />
            {product.isNew && <Pill className="border-cyan/30 text-cyan">New</Pill>}
          </div>
          <p className="mt-1 text-sm text-text-2">{product.shortDescription}</p>
        </div>
        <span className="hidden text-sm text-muted md:block">{product.category?.name}</span>
        <span className="inline-flex items-center gap-1 text-sm font-semibold text-cyan">View details <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" /></span>
      </Link>
    );
  }
  return (
    <TiltCard glow={product.accentColor} className="group rounded-[1.25rem]" max={7}>
      <Link href={href} className="glass relative flex h-full flex-col overflow-hidden rounded-[1.25rem] p-5 transition-colors hover:border-white/25">
        <div className="tilt-inner">
          {product.heroImageUrl ? (
            <div className="relative aspect-[16/10] overflow-hidden rounded-xl border border-white/10">
              <Image src={product.heroImageUrl} alt={`${product.name} screenshot`} fill sizes="(min-width:1024px) 33vw, 100vw" className="object-cover" />
            </div>
          ) : (
            <ProductVisual accent={product.accentColor} icon={product.icon} name={product.name} variant={index} className="aspect-[16/10]" />
          )}
        </div>
        <div className="mt-5 flex items-start justify-between gap-3">
          <span className="grid size-11 shrink-0 place-items-center rounded-xl" style={{ background: `${product.accentColor}1f`, color: product.accentColor }}>
            {product.logoUrl ? <Image src={product.logoUrl} alt="" width={28} height={28} className="rounded" /> : <Icon name={product.icon} className="size-5" />}
          </span>
          <div className="flex flex-wrap justify-end gap-1.5">
            {product.isNew && <Pill className="border-cyan/30 text-cyan">New</Pill>}
            <StatusBadge status={product.status} />
          </div>
        </div>
        <h3 className="mt-4 font-display text-xl font-semibold">{product.name}</h3>
        {product.category && <p className="mt-1 text-xs font-medium tracking-wide text-muted uppercase">{product.category.name}</p>}
        <p className="mt-3 line-clamp-3 flex-1 text-sm text-text-2">{product.shortDescription}</p>
        <span className={clsx("mt-5 inline-flex items-center gap-1 text-sm font-semibold text-cyan")}>
          View details <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </span>
      </Link>
    </TiltCard>
  );
}
