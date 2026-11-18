import { ArrowRight } from "lucide-react";
import { HeroCanvas } from "../three/SceneGate";
import { ButtonLink } from "../ui/Button";
import { Magnetic } from "../ui/Magnetic";
import { Icon } from "../ui/Icon";
import type { SiteContent } from "@/lib/site-defaults";
import type { ProductCard } from "@/lib/data";
import { HeroTitle } from "./HeroTitle";

export function Hero({ settings, products }: { settings: SiteContent; products: ProductCard[] }) {
  const satellites = products.map((p) => ({ color: p.accentColor, label: p.name }));
  const floating = products.filter((p) => p.featured).slice(0, 3);
  return (
    <section className="noise relative isolate flex min-h-[100svh] items-center overflow-hidden pt-28 pb-16">
      <div aria-hidden="true" className="absolute inset-0 -z-20 bg-[radial-gradient(ellipse_80%_60%_at_70%_40%,rgba(52,120,255,0.22),transparent_60%),radial-gradient(ellipse_60%_50%_at_10%_80%,rgba(98,91,255,0.18),transparent_60%)]" />
      <div aria-hidden="true" className="grid-lines absolute inset-0 -z-20" />
      <div className="absolute inset-0 -z-10 lg:left-[35%]">
        <HeroCanvas satellites={satellites.length ? satellites : [{ color: "#00D4FF", label: "" }]} />
      </div>
      {/* gradient keeps copy readable over the scene on small screens */}
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-r from-bg via-bg/70 to-transparent lg:via-bg/40" />

      <div className="container-pp grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <p className="glass inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-medium text-text-2">
            <span className="relative flex size-2"><span className="absolute inline-flex size-full animate-pulse-ring rounded-full bg-cyan" /><span className="relative inline-flex size-2 rounded-full bg-cyan" /></span>
            {settings.hero.eyebrow}
          </p>
          <HeroTitle text={settings.hero.title} />
          <p className="mt-6 max-w-xl text-lg text-text-2 sm:text-xl">{settings.hero.subtitle}</p>
          <div className="mt-9 flex flex-wrap items-center gap-3">
            <Magnetic>
              <ButtonLink href="/software" size="lg">
                {settings.hero.primaryCta}
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
              </ButtonLink>
            </Magnetic>
            <ButtonLink href="/pricing" variant="secondary" size="lg">{settings.hero.secondaryCta}</ButtonLink>
          </div>
          <p className="mt-8 text-sm text-muted">{settings.brand.supportingTagline}</p>
        </div>

        {/* Floating 3D product cards */}
        <div className="relative hidden h-[460px] [perspective:1200px] lg:block" aria-label="Featured products">
          {floating.map((p, i) => (
            <a
              key={p.id}
              href={`/software/${p.slug}`}
              className="absolute w-60 animate-float border border-white/15 bg-surface/80 backdrop-blur-xl rounded-2xl p-4 shadow-[0_30px_60px_-30px_rgba(0,0,0,0.9)] transition-transform duration-500 hover:[transform:rotateY(0deg)_rotateX(0deg)_translateZ(40px)]"
              style={{
                top: `${[0, 58, 74][i]}%`, left: `${[58, -6, 62][i]}%`,
                transform: `rotateY(${[-18, 14, -10][i]}deg) rotateX(${[8, -6, 10][i]}deg)`,
                animationDelay: `${i * 1.3}s`,
              }}
            >
              <div className="flex items-center gap-3">
                <span className="grid size-9 place-items-center rounded-lg" style={{ background: `${p.accentColor}22`, color: p.accentColor }}><Icon name={p.icon} className="size-4" /></span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{p.name.replace(/^PowerPulse\s+/, "")}</p>
                  <p className="truncate text-xs text-text-2">{p.category?.name}</p>
                </div>
              </div>
              <div className="mt-3 flex h-10 items-end gap-1">
                {[40, 65, 50, 80, 60, 92].map((h, j) => (
                  <span key={j} className="flex-1 rounded-sm" style={{ height: `${h}%`, background: p.accentColor, opacity: 0.25 + j * 0.12 }} />
                ))}
              </div>
            </a>
          ))}
        </div>
      </div>

      <a href="#ecosystem" className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 text-xs text-muted sm:flex" aria-label="Scroll to ecosystem">
        <span className="h-10 w-6 rounded-full border border-white/20 p-1"><span className="block h-2 w-full animate-bounce rounded-full bg-cyan" /></span>
      </a>
    </section>
  );
}
