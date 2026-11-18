import type { Metadata } from "next";
import { Compass, Eye, Lightbulb } from "lucide-react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { EcosystemOrbit } from "@/components/sections/EcosystemOrbit";
import { CtaBand } from "@/components/sections/CtaBand";
import { getPublicProducts, getSettings } from "@/lib/data";

export const metadata: Metadata = {
  title: "About",
  description: "PowerPulse's vision, mission, values and roadmap for a growing ecosystem of business software.",
  alternates: { canonical: "/about" },
};

export default async function AboutPage() {
  const [settings, products] = await Promise.all([getSettings(), getPublicProducts()]);
  const a = settings.about;
  return (
    <>
      <section className="container-pp pt-32">
        <SectionHeading as="h1" eyebrow="About PowerPulse" title={<>We build software businesses <span className="text-gradient">run on</span></>} body={settings.intro.body} />
      </section>

      <section className="container-pp py-20">
        <div className="grid gap-5 md:grid-cols-3">
          {[
            { icon: Eye, title: "Vision", body: a.vision },
            { icon: Compass, title: "Mission", body: a.mission },
            { icon: Lightbulb, title: "Innovation philosophy", body: a.philosophy },
          ].map((c) => (
            <div key={c.title} data-reveal className="glass rounded-[1.25rem] p-7">
              <c.icon className="size-7 text-cyan" aria-hidden="true" />
              <h2 className="mt-5 font-display text-xl font-semibold">{c.title}</h2>
              <p className="mt-3 text-text-2">{c.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="container-pp py-20">
        <SectionHeading eyebrow="Values" title="What we hold ourselves to" />
        <div className="mt-12 grid gap-5 sm:grid-cols-2">
          {a.values.map((v, i) => (
            <div key={v.title} data-reveal className="glass flex gap-5 rounded-[1.25rem] p-6">
              <span className="text-gradient font-display text-3xl font-semibold">{String(i + 1).padStart(2, "0")}</span>
              <div><h3 className="font-display text-lg font-semibold">{v.title}</h3><p className="mt-1 text-text-2">{v.body}</p></div>
            </div>
          ))}
        </div>
      </section>

      <section className="container-pp py-20">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <SectionHeading align="left" eyebrow="The ecosystem" title="Independent products, one foundation" body="Every PowerPulse product can be used on its own. Behind the scenes they share the same infrastructure, security model and design system, which is how a small team can run many products well." />
          <EcosystemOrbit products={products} />
        </div>
      </section>

      <section className="container-pp py-20">
        <SectionHeading eyebrow="Roadmap" title="Where we're going" />
        <ol className="relative mx-auto mt-14 max-w-3xl border-l border-white/10 pl-8">
          {a.roadmap.map((r) => (
            <li key={r.title} data-reveal className="relative pb-10 last:pb-0">
              <span className="absolute top-1.5 -left-[2.4rem] size-3.5 rounded-full border-2 border-cyan bg-bg shadow-[0_0_16px_rgba(0,212,255,0.7)]" aria-hidden="true" />
              <p className="text-xs font-semibold tracking-[0.2em] text-cyan uppercase">{r.period}</p>
              <h3 className="mt-1 font-display text-xl font-semibold">{r.title}</h3>
              <p className="mt-1 text-text-2">{r.body}</p>
            </li>
          ))}
        </ol>
      </section>

      <CtaBand {...settings.cta} />
    </>
  );
}
