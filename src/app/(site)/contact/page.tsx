import type { Metadata } from "next";
import { Handshake, LifeBuoy, Mail, TrendingUp } from "lucide-react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { InquiryForm } from "@/components/sections/InquiryForm";
import { getSettings } from "@/lib/data";
import { prisma } from "@/lib/db";

export const metadata: Metadata = {
  title: "Contact",
  description: "Contact PowerPulse for sales, partnerships or technical support.",
  alternates: { canonical: "/contact" },
};

export default async function ContactPage({ searchParams }: { searchParams: Promise<{ type?: string; plan?: string; product?: string }> }) {
  const [{ type, plan, product }, settings] = await Promise.all([searchParams, getSettings()]);
  const productRow = product ? await prisma.product.findUnique({ where: { slug: product }, select: { slug: true, name: true } }) : null;
  const c = settings.contact;
  const channels = [
    { icon: TrendingUp, title: "Sales", body: "Plans, pricing and custom terms.", email: c.salesEmail },
    { icon: Handshake, title: "Partnerships", body: "Resellers, integrations and collaborations.", email: c.email },
    { icon: LifeBuoy, title: "Technical support", body: "Help for existing customers.", email: c.supportEmail },
  ];
  return (
    <div className="container-pp pt-32 pb-12">
      <SectionHeading as="h1" eyebrow="Contact" title={<>Let&apos;s <span className="text-gradient">talk</span></>} body="Send us a message and the right team will reply by email." />
      <div className="mt-14 grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
        <div className="space-y-4">
          {channels.map((ch) => (
            <div key={ch.title} data-reveal className="glass flex gap-4 rounded-2xl p-5">
              <ch.icon className="mt-0.5 size-6 shrink-0 text-cyan" aria-hidden="true" />
              <div className="min-w-0">
                <h2 className="font-display font-semibold">{ch.title}</h2>
                <p className="text-sm text-text-2">{ch.body}</p>
                <a href={`mailto:${ch.email}`} className="mt-2 inline-flex min-h-8 items-center gap-1.5 text-sm break-all text-cyan hover:underline"><Mail className="size-4 shrink-0" aria-hidden="true" />{ch.email}</a>
              </div>
            </div>
          ))}
          {(c.phone || c.address) && (
            <div data-reveal className="glass rounded-2xl p-5 text-sm text-text-2">
              {c.phone && <p>Phone: <a href={`tel:${c.phone}`} className="text-text">{c.phone}</a></p>}
              {c.address && <p className="mt-1">{c.address}</p>}
            </div>
          )}
          <div data-reveal className="flex flex-wrap gap-2 pt-2">
            {settings.socials.map((s) => <a key={s.label} href={s.url} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-10 items-center rounded-full border border-white/10 px-4 text-sm text-text-2 hover:border-white/25 hover:text-text">{s.label}</a>)}
          </div>
        </div>
        <div data-reveal>
          <InquiryForm defaultType={type?.toUpperCase()} planName={plan} productSlug={productRow?.slug} productName={productRow?.name} />
        </div>
      </div>
    </div>
  );
}
