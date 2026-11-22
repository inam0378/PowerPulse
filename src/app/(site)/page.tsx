import { ArrowRight, Quote, Star } from "lucide-react";
import { Hero } from "@/components/sections/Hero";
import { ProductCard } from "@/components/sections/ProductCard";
import { ProjectCard } from "@/components/sections/ProjectCard";
import { EcosystemOrbit } from "@/components/sections/EcosystemOrbit";
import { CategoryExplorer } from "@/components/sections/CategoryExplorer";
import { PricingTable } from "@/components/sections/PricingTable";
import { FaqList } from "@/components/sections/FaqList";
import { CtaBand } from "@/components/sections/CtaBand";
import { TabletAppBand } from "@/components/sections/TabletAppBand";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ButtonLink } from "@/components/ui/Button";
import { Counter } from "@/components/ui/Counter";
import { Icon } from "@/components/ui/Icon";
import { Pill } from "@/components/ui/Badge";
import { prisma } from "@/lib/db";
import {
  getEcosystemPlans, getGeneralFaqs, getPublicProducts, getPublishedProjects, getSettings, getTestimonials, PUBLIC_STATUSES,
} from "@/lib/data";
import { toPricingPlan } from "@/lib/plans";

export default async function HomePage() {
  const [settings, products, plans, projects, testimonials, faqs, categories] = await Promise.all([
    getSettings(), getPublicProducts(), getEcosystemPlans(), getPublishedProjects(), getTestimonials(), getGeneralFaqs(),
    prisma.category.findMany({
      orderBy: { sortOrder: "asc" },
      include: {
        products: {
          where: { status: { in: [...PUBLIC_STATUSES] } }, orderBy: { sortOrder: "asc" },
          select: { slug: true, name: true, shortDescription: true, icon: true, accentColor: true, status: true },
        },
      },
    }),
  ]);
  const featured = products.filter((p) => p.featured);
  // Fill complete rows of three: featured first, then other products.
  const ordered = [...featured, ...products.filter((p) => !p.featured)];
  const featuredProducts = ordered.slice(0, Math.min(ordered.length, featured.length > 3 ? 6 : 3));

  return (
    <>
      <Hero settings={settings} products={products} />

      <TabletAppBand />

      {/* Introduction + ecosystem overview */}
      <section id="ecosystem" className="container-pp scroll-mt-24 py-24">
        <div className="grid items-center gap-14 lg:grid-cols-2">
          <div>
            <SectionHeading align="left" eyebrow="The ecosystem" title={settings.intro.title} body={settings.intro.body} />
            <dl className="mt-10 grid gap-4 sm:grid-cols-3">
              {[
                ["Independent", "Subscribe per product, no forced bundles"],
                ["Connected", "One standard for security & design"],
                ["Growing", "New products added continuously"],
              ].map(([t, d]) => (
                <div key={t} data-reveal className="glass rounded-2xl p-4">
                  <dt className="font-display font-semibold text-cyan">{t}</dt>
                  <dd className="mt-1 text-sm text-text-2">{d}</dd>
                </div>
              ))}
            </dl>
          </div>
          <EcosystemOrbit products={products} />
        </div>
      </section>

      {/* Featured products */}
      <section className="relative py-24">
        <div aria-hidden="true" className="absolute inset-x-0 top-1/3 -z-10 mx-auto h-96 max-w-4xl rounded-full bg-royal/10 blur-[140px]" />
        <div className="container-pp">
          <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
            <SectionHeading align="left" eyebrow="Featured software" title="Purpose-built products, one standard of quality" />
            <ButtonLink href="/software" variant="secondary" data-reveal>All software <ArrowRight className="size-4" /></ButtonLink>
          </div>
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {featuredProducts.map((p, i) => (
              <div key={p.id} data-reveal><ProductCard product={p} index={i} /></div>
            ))}
          </div>
        </div>
      </section>

      {/* Why PowerPulse */}
      <section className="container-pp py-24">
        <SectionHeading eyebrow="Why PowerPulse" title="Software you can build a business on" />
        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {settings.why.map((w, i) => (
            <div key={w.title} data-reveal className="glass group relative overflow-hidden rounded-[1.25rem] p-6">
              <span className="font-display text-sm text-muted">0{i + 1}</span>
              <span className="mt-6 grid size-12 place-items-center rounded-xl bg-gradient-to-br from-cyan/20 to-royal/20 text-cyan ring-1 ring-white/10 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6">
                <Icon name={w.icon} className="size-6" />
              </span>
              <h3 className="mt-5 font-display text-lg font-semibold">{w.title}</h3>
              <p className="mt-2 text-sm text-text-2">{w.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      {categories.some((c) => c.products.length) && (
        <section className="container-pp py-24">
          <SectionHeading eyebrow="Explore by category" title="Find the software for your industry" />
          <div className="mt-12" data-reveal><CategoryExplorer categories={categories} /></div>
        </section>
      )}

      {/* Stats */}
      <section className="py-20">
        <div className="container-pp">
          <div className="glass grid grid-cols-2 gap-px overflow-hidden rounded-[1.5rem] bg-white/5 lg:grid-cols-4" data-reveal>
            {settings.stats.map((s) => (
              <div key={s.label} className="bg-bg-2/80 p-6 text-center sm:p-10">
                <p className="text-gradient font-display text-4xl font-semibold sm:text-5xl"><Counter value={s.value} prefix={s.prefix} suffix={s.suffix} /></p>
                <p className="mt-2 text-sm text-text-2">{s.label}</p>
              </div>
            ))}
          </div>
          {settings.statsNote && <p className="mt-3 text-center text-xs text-muted">{settings.statsNote}</p>}
        </div>
      </section>

      {/* Projects */}
      {projects.length > 0 && (
        <section className="container-pp py-24">
          <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
            <SectionHeading align="left" eyebrow="Projects" title="Recent and upcoming work" />
            <ButtonLink href="/projects" variant="secondary" data-reveal>All projects <ArrowRight className="size-4" /></ButtonLink>
          </div>
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {projects.slice(0, 3).map((p) => <div key={p.id} data-reveal><ProjectCard project={p} /></div>)}
          </div>
        </section>
      )}

      {/* Pricing overview */}
      {plans.length > 0 && (
        <section className="container-pp py-24">
          <SectionHeading eyebrow="Pricing" title="Ecosystem plans" body="Access several PowerPulse products under one subscription. Each product also has its own plans." />
          <div className="mt-12"><PricingTable plans={plans.map(toPricingPlan)} compact /></div>
          <p className="mt-8 text-center"><ButtonLink href="/pricing" variant="ghost">Compare all plans and product pricing <ArrowRight className="size-4" /></ButtonLink></p>
        </section>
      )}

      {/* Testimonials */}
      {testimonials.length > 0 && (
        <section className="container-pp py-24">
          <SectionHeading eyebrow="Customers" title="What teams say about PowerPulse" />
          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {testimonials.map((t) => (
              <figure key={t.id} data-reveal className="glass relative flex flex-col rounded-[1.25rem] p-6">
                <div className="flex items-center justify-between">
                  <Quote className="size-7 text-cyan/60" aria-hidden="true" />
                  {t.isSample && <Pill className="border-warning/30 text-warning">Sample content</Pill>}
                </div>
                <div className="mt-4 flex gap-0.5" aria-label={`${t.rating} out of 5 stars`}>
                  {Array.from({ length: 5 }).map((_, i) => <Star key={i} className={i < t.rating ? "size-4 fill-cyan text-cyan" : "size-4 text-white/15"} aria-hidden="true" />)}
                </div>
                <blockquote className="mt-4 flex-1 text-text-2">“{t.quote}”</blockquote>
                <figcaption className="mt-6 border-t border-white/10 pt-4">
                  <p className="font-semibold">{t.name}</p>
                  <p className="text-sm text-muted">{[t.role, t.company].filter(Boolean).join(", ")}</p>
                </figcaption>
              </figure>
            ))}
          </div>
        </section>
      )}

      {/* FAQ */}
      {faqs.length > 0 && (
        <section className="container-pp py-24">
          <SectionHeading eyebrow="FAQ" title="Questions, answered" />
          <div className="mt-12"><FaqList faqs={faqs} /></div>
        </section>
      )}

      <CtaBand {...settings.cta} />
    </>
  );
}
