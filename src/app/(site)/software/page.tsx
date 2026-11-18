import type { Metadata } from "next";
import { ProductDirectory } from "@/components/sections/ProductDirectory";
import { ProductCard } from "@/components/sections/ProductCard";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { getCategoriesWithCounts, getPublicProducts } from "@/lib/data";

export const metadata: Metadata = {
  title: "Software",
  description: "Browse every PowerPulse software product: business management, CRM, POS, HR & payroll, property, pharmacy, restaurant and more.",
  alternates: { canonical: "/software" },
};

export default async function SoftwarePage({ searchParams }: { searchParams: Promise<{ category?: string }> }) {
  const [{ category }, products, categories] = await Promise.all([searchParams, getPublicProducts(), getCategoriesWithCounts()]);
  const newReleases = products.filter((p) => p.isNew).slice(0, 3);
  return (
    <div className="pt-32 pb-12">
      <div className="container-pp">
        <SectionHeading as="h1" eyebrow="Software directory" title={<>Every PowerPulse <span className="text-gradient">product</span>, in one place</>} body="Each product is independent. Pick exactly what your business needs." />

        {newReleases.length > 0 && (
          <section aria-labelledby="new-releases" className="mt-16">
            <h2 id="new-releases" className="font-display text-xl font-semibold" data-reveal>New releases</h2>
            <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {newReleases.map((p, i) => <div key={p.id} data-reveal><ProductCard product={p} index={i + 3} /></div>)}
            </div>
          </section>
        )}

        <section aria-labelledby="all-software" className="mt-20">
          <h2 id="all-software" className="mb-5 font-display text-xl font-semibold">All software</h2>
          <ProductDirectory
            products={products}
            initialCategory={category}
            categories={categories.filter((c) => c._count.products > 0).map((c) => ({ slug: c.slug, name: c.name, count: c._count.products }))}
          />
        </section>
      </div>
    </div>
  );
}
