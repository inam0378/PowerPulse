import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, Check, Target } from "lucide-react";
import { ProductCanvas } from "@/components/three/SceneGate";
import { PricingTable } from "@/components/sections/PricingTable";
import { FaqList } from "@/components/sections/FaqList";
import { InquiryForm } from "@/components/sections/InquiryForm";
import { ProductCard } from "@/components/sections/ProductCard";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ButtonLink } from "@/components/ui/Button";
import { Magnetic } from "@/components/ui/Magnetic";
import { Icon } from "@/components/ui/Icon";
import { StatusBadge } from "@/components/ui/Badge";
import { ProductVisual } from "@/components/ui/ProductVisual";
import { getProductBySlug, getPublicProducts } from "@/lib/data";
import { asFeatures, asStringArray } from "@/lib/format";
import { toPricingPlan } from "@/lib/plans";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const product = await getProductBySlug((await params).slug);
  if (!product) notFound();
  return {
    title: product.name,
    description: product.shortDescription,
    alternates: { canonical: `/software/${product.slug}` },
    openGraph: { title: product.name, description: product.shortDescription, images: product.heroImageUrl ? [product.heroImageUrl] : undefined },
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const features = asFeatures(product.features);
  const benefits = asStringArray(product.benefits);
  const audience = asStringArray(product.audience);
  const screenshots = asStringArray(product.screenshots);
  const available = product.status === "PUBLISHED";
  const related = (await getPublicProducts()).filter((p) => p.id !== product.id && p.category?.slug === product.category?.slug).slice(0, 3);
  const others = related.length ? related : (await getPublicProducts()).filter((p) => p.id !== product.id).slice(0, 3);
  const accent = product.accentColor;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: product.name,
    description: product.shortDescription,
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    ...(product.plans.some((p) => p.monthlyCents != null) && {
      offers: product.plans.filter((p) => p.monthlyCents != null).map((p) => ({ "@type": "Offer", name: p.name, price: (p.monthlyCents! / 100).toFixed(2), priceCurrency: p.currency })),
    }),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />

      {/* Hero */}
      <section className="noise relative isolate overflow-hidden pt-28 pb-16 sm:pt-32">
        <div aria-hidden="true" className="absolute inset-0 -z-20" style={{ background: `radial-gradient(ellipse 70% 60% at 75% 40%, ${accent}33, transparent 60%), radial-gradient(ellipse 50% 50% at 0% 100%, #625BFF22, transparent 60%)` }} />
        <div aria-hidden="true" className="grid-lines absolute inset-0 -z-20" />
        <div className="container-pp">
          <Link href="/software" className="inline-flex min-h-10 items-center gap-2 text-sm text-text-2 hover:text-text"><ArrowLeft className="size-4" aria-hidden="true" /> All software</Link>
          <div className="mt-6 grid items-center gap-10 lg:grid-cols-2">
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <span className="grid size-14 place-items-center rounded-2xl ring-1 ring-white/10" style={{ background: `${accent}22`, color: accent }}>
                  {product.logoUrl ? <Image src={product.logoUrl} alt={`${product.name} logo`} width={36} height={36} /> : <Icon name={product.icon} className="size-7" />}
                </span>
                <StatusBadge status={product.status} />
                {product.category && <Link href={`/software?category=${product.category.slug}`} className="text-sm text-text-2 hover:text-text">{product.category.name}</Link>}
              </div>
              <h1 className="mt-6 font-display text-4xl font-semibold sm:text-5xl lg:text-6xl">{product.name}</h1>
              {product.tagline && <p className="mt-4 text-xl font-medium" style={{ color: accent }}>{product.tagline}</p>}
              <p className="mt-5 max-w-xl text-lg text-text-2">{product.shortDescription}</p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Magnetic>
                  <ButtonLink href={available ? "#pricing" : "#demo"} size="lg">
                    {available ? "Get started" : "Join the waitlist"} <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                  </ButtonLink>
                </Magnetic>
                <ButtonLink href="#demo" variant="secondary" size="lg">Request a demo</ButtonLink>
              </div>
              {!available && <p className="mt-4 text-sm text-warning">This product is not yet available for subscription. Request a demo or join the waitlist.</p>}
            </div>
            <div className="relative h-[340px] sm:h-[420px]">
              <ProductCanvas shape={product.visualShape} color={accent} />
              <p className="absolute bottom-0 w-full text-center text-xs text-muted">Drag to rotate</p>
            </div>
          </div>
        </div>
      </section>

      {/* Overview + preview */}
      <section className="container-pp py-20">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <SectionHeading align="left" eyebrow="Overview" title={`What ${product.name.replace(/^PowerPulse\s+/, "")} does`} />
            <p className="mt-6 text-lg whitespace-pre-line text-text-2" data-reveal>{product.overview || product.shortDescription}</p>
          </div>
          <div data-reveal className="[perspective:1400px]">
            <div className="transition-transform duration-700 [transform:rotateY(-10deg)_rotateX(4deg)] hover:[transform:rotateY(0)_rotateX(0)]">
              {product.heroImageUrl ? (
                <Image src={product.heroImageUrl} alt={`${product.name} screenshot`} width={1200} height={750} className="rounded-xl border border-white/10" />
              ) : (
                <ProductVisual accent={accent} icon={product.icon} name={product.name} className="shadow-[0_40px_80px_-30px_rgba(0,0,0,0.9)]" />
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      {features.length > 0 && (
        <section className="container-pp py-20">
          <SectionHeading eyebrow="Features" title="Everything you need, nothing you don't" />
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f, i) => (
              <div key={f.title} data-reveal className="glass group rounded-[1.25rem] p-6 transition-colors hover:border-white/25">
                <span className="grid size-10 place-items-center rounded-xl font-display text-sm font-semibold" style={{ background: `${accent}1f`, color: accent }}>{String(i + 1).padStart(2, "0")}</span>
                <h3 className="mt-5 font-display text-lg font-semibold">{f.title}</h3>
                {f.description && <p className="mt-2 text-sm text-text-2">{f.description}</p>}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Screenshots */}
      {(screenshots.length > 0 || product.videoUrl) && (
        <section className="container-pp py-20">
          <SectionHeading eyebrow="Screenshots" title="See it in action" />
          {product.videoUrl && (
            <video src={product.videoUrl} controls preload="metadata" className="mx-auto mt-12 w-full max-w-4xl rounded-2xl border border-white/10" />
          )}
          {screenshots.length > 0 && (
            <div className="mt-12 flex snap-x snap-mandatory gap-5 overflow-x-auto pb-4">
              {screenshots.map((src, i) => (
                <Image key={src} src={src} alt={`${product.name} screenshot ${i + 1}`} width={960} height={600} className="w-[85%] shrink-0 snap-center rounded-xl border border-white/10 sm:w-[60%]" />
              ))}
            </div>
          )}
        </section>
      )}

      {/* Benefits + audience */}
      {(benefits.length > 0 || audience.length > 0) && (
        <section className="container-pp py-20">
          <div className="grid gap-5 lg:grid-cols-2">
            {benefits.length > 0 && (
              <div data-reveal className="glass rounded-[1.25rem] p-8">
                <h2 className="font-display text-2xl font-semibold">Benefits</h2>
                <ul className="mt-6 space-y-4">
                  {benefits.map((b) => <li key={b} className="flex gap-3 text-text-2"><Check className="mt-1 size-5 shrink-0" style={{ color: accent }} aria-hidden="true" />{b}</li>)}
                </ul>
              </div>
            )}
            {audience.length > 0 && (
              <div data-reveal className="glass rounded-[1.25rem] p-8">
                <h2 className="font-display text-2xl font-semibold">Who it&apos;s for</h2>
                <ul className="mt-6 space-y-4">
                  {audience.map((a) => <li key={a} className="flex gap-3 text-text-2"><Target className="mt-1 size-5 shrink-0" style={{ color: accent }} aria-hidden="true" />{a}</li>)}
                </ul>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Pricing */}
      <section id="pricing" className="container-pp scroll-mt-24 py-20">
        <SectionHeading eyebrow="Pricing" title={`${product.name.replace(/^PowerPulse\s+/, "")} plans`} body={<>These plans cover <strong className="text-text">{product.name} only</strong>. Need several products? See <Link href="/pricing" className="text-cyan underline-offset-4 hover:underline">ecosystem plans</Link>.</>} />
        <div className="mt-12">
          {available ? (
            <PricingTable plans={product.plans.map(toPricingPlan)} productSlug={product.slug} />
          ) : (
            <p className="glass mx-auto max-w-xl rounded-2xl p-6 text-center text-text-2">Pricing will be published when {product.name} becomes available. Request a demo below to be notified first.</p>
          )}
        </div>
      </section>

      {/* FAQ */}
      {product.faqs.length > 0 && (
        <section className="container-pp py-20">
          <SectionHeading eyebrow="FAQ" title="Common questions" />
          <div className="mt-12"><FaqList faqs={product.faqs} /></div>
        </section>
      )}

      {/* Demo request */}
      <section id="demo" className="container-pp scroll-mt-24 py-20">
        <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
          <SectionHeading align="left" eyebrow="Demo" title="See it with your own data" body={`Tell us about your business and we'll arrange a walkthrough of ${product.name}.`} />
          <div data-reveal><InquiryForm defaultType="DEMO" productSlug={product.slug} productName={product.name} hideType /></div>
        </div>
      </section>

      {/* Related */}
      {others.length > 0 && (
        <section className="container-pp py-20">
          <h2 className="font-display text-2xl font-semibold" data-reveal>More from PowerPulse</h2>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {others.map((p, i) => <div key={p.id} data-reveal><ProductCard product={p} index={i} /></div>)}
          </div>
        </section>
      )}
    </>
  );
}
