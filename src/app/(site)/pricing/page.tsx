import type { Metadata } from "next";
import { Check, Layers, Package } from "lucide-react";
import { PricingTable } from "@/components/sections/PricingTable";
import { ProductPlans } from "@/components/sections/ProductPlans";
import { FaqList } from "@/components/sections/FaqList";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { getEcosystemPlans, getGeneralFaqs, getProductPlansOverview } from "@/lib/data";
import { annualSavings, asLimits, asStringArray, formatPrice } from "@/lib/format";
import { toPricingPlan } from "@/lib/plans";

export const metadata: Metadata = {
  title: "Pricing",
  description: "Monthly and yearly pricing for PowerPulse ecosystem plans and individual software products.",
  alternates: { canonical: "/pricing" },
};

export default async function PricingPage() {
  const [plans, productPlans, faqs] = await Promise.all([getEcosystemPlans(), getProductPlansOverview(), getGeneralFaqs()]);

  // Comparison rows: every limit label used by any plan, then support & access.
  const limitLabels = Array.from(new Set(plans.flatMap((p) => asLimits(p.limits).map((l) => l.label))));
  const featureSet = Array.from(new Set(plans.flatMap((p) => asStringArray(p.features))));

  return (
    <div className="pt-32 pb-12">
      <div className="container-pp">
        <SectionHeading as="h1" eyebrow="Pricing" title={<>Simple pricing. <span className="text-gradient">Pay for what you use.</span></>} body="Choose an ecosystem plan to access several products, or subscribe to a single product. Switch to yearly billing to save." />

        {/* Explain the two plan types */}
        <div className="mx-auto mt-12 grid max-w-4xl gap-4 md:grid-cols-2">
          <div data-reveal className="glass rounded-2xl p-5">
            <Layers className="size-6 text-cyan" aria-hidden="true" />
            <h2 className="mt-3 font-display text-lg font-semibold">Ecosystem plans</h2>
            <p className="mt-1 text-sm text-text-2">One subscription that unlocks a set number of PowerPulse products. The access is listed on each plan.</p>
          </div>
          <div data-reveal className="glass rounded-2xl p-5">
            <Package className="size-6 text-royal" aria-hidden="true" />
            <h2 className="mt-3 font-display text-lg font-semibold">Product plans</h2>
            <p className="mt-1 text-sm text-text-2">Priced for one product only. Subscribing to one product <strong className="text-text">does not</strong> include access to any other.</p>
          </div>
        </div>

        <section aria-labelledby="eco" className="mt-20">
          <h2 id="eco" className="mb-10 text-center font-display text-3xl font-semibold" data-reveal>Ecosystem plans</h2>
          <PricingTable plans={plans.map(toPricingPlan)} />
        </section>

        {plans.length > 0 && (
          <section aria-labelledby="compare" className="mt-24">
            <h2 id="compare" className="text-center font-display text-3xl font-semibold" data-reveal>Compare ecosystem plans</h2>
            <div className="glass mt-10 overflow-x-auto rounded-2xl" data-reveal>
              <table className="w-full min-w-[720px] text-left text-sm">
                <caption className="sr-only">Ecosystem plan comparison</caption>
                <thead>
                  <tr className="border-b border-white/10">
                    <th scope="col" className="p-4 font-medium text-text-2">Plan</th>
                    {plans.map((p) => <th key={p.id} scope="col" className="p-4 font-display text-base font-semibold">{p.name}</th>)}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  <tr>
                    <th scope="row" className="p-4 font-medium text-text-2">Monthly</th>
                    {plans.map((p) => <td key={p.id} className="p-4 tabular-nums">{p.isCustom ? "Custom" : formatPrice(p.monthlyCents, p.currency) ?? "N/A"}</td>)}
                  </tr>
                  <tr>
                    <th scope="row" className="p-4 font-medium text-text-2">Yearly</th>
                    {plans.map((p) => {
                      const s = annualSavings(p.monthlyCents, p.yearlyCents);
                      return <td key={p.id} className="p-4 tabular-nums">{p.isCustom ? "Custom" : formatPrice(p.yearlyCents, p.currency) ?? "N/A"}{s && <span className="block text-xs text-success">save {s.percent}%</span>}</td>;
                    })}
                  </tr>
                  <tr>
                    <th scope="row" className="p-4 font-medium text-text-2">Product access</th>
                    {plans.map((p) => <td key={p.id} className="p-4 text-text-2">{p.productAccess || "N/A"}</td>)}
                  </tr>
                  {limitLabels.map((label) => (
                    <tr key={label}>
                      <th scope="row" className="p-4 font-medium text-text-2">{label}</th>
                      {plans.map((p) => <td key={p.id} className="p-4">{asLimits(p.limits).find((l) => l.label === label)?.value ?? "N/A"}</td>)}
                    </tr>
                  ))}
                  <tr>
                    <th scope="row" className="p-4 font-medium text-text-2">Support</th>
                    {plans.map((p) => <td key={p.id} className="p-4 text-text-2">{p.supportLevel || "N/A"}</td>)}
                  </tr>
                  {featureSet.map((f) => (
                    <tr key={f}>
                      <th scope="row" className="p-4 font-normal text-text-2">{f}</th>
                      {plans.map((p) => (
                        <td key={p.id} className="p-4">
                          {asStringArray(p.features).includes(f) ? <Check className="size-4 text-cyan" aria-label="Included" /> : <span className="text-muted" aria-label="Not included">–</span>}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {productPlans.length > 0 && (
          <section aria-labelledby="product-pricing" className="mt-24">
            <SectionHeading eyebrow="Individual products" title="Product plans" body="Only need one product? Subscribe to it on its own." />
            <div className="mt-10">
              <ProductPlans
                items={productPlans.map((p) => ({ id: p.id, slug: p.slug, name: p.name, icon: p.icon, accentColor: p.accentColor, available: p.status === "PUBLISHED", plans: p.plans.map(toPricingPlan) }))}
              />
            </div>
          </section>
        )}

        <p className="mx-auto mt-16 max-w-2xl rounded-xl border border-white/10 bg-white/[0.02] p-4 text-center text-sm text-text-2">
          Online checkout is not live yet. Choosing a plan creates your account and request, and our team contacts you to activate the subscription. Prices shown are in USD and exclude applicable taxes.
        </p>

        {faqs.length > 0 && (
          <section className="mt-24">
            <SectionHeading eyebrow="FAQ" title="Billing questions" />
            <div className="mt-10"><FaqList faqs={faqs} /></div>
          </section>
        )}
      </div>
    </div>
  );
}
