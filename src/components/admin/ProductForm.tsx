import type { Category, Product } from "@prisma/client";
import { saveProduct } from "@/app/admin/actions";
import { AdminForm } from "./AdminForm";
import { Area, Check, Section, Select, Text } from "./Fields";
import { MediaField } from "./MediaField";
import { iconNames } from "../ui/Icon";
import { shapeNames } from "@/lib/shapes";
import { asFeatures, asStringArray, productStatusLabel } from "@/lib/format";

export function ProductForm({ product, categories }: { product?: Product; categories: Category[] }) {
  const p = product;
  return (
    <AdminForm action={saveProduct} submitLabel={p ? "Save changes" : "Create product"}>
      {p && <input type="hidden" name="id" value={p.id} />}
      <Section title="Basics">
        <Text label="Product name" name="name" defaultValue={p?.name} required />
        <Text label="URL slug" name="slug" defaultValue={p?.slug} hint="Leave empty to generate from the name." />
        <Text label="Tagline" name="tagline" defaultValue={p?.tagline} className="sm:col-span-2" />
        <Area label="Short description" name="shortDescription" defaultValue={p?.shortDescription} rows={2} className="sm:col-span-2" hint="Shown on product cards and in search results." />
        <Area label="Overview" name="overview" defaultValue={p?.overview} rows={5} className="sm:col-span-2" />
      </Section>
      <Section title="Publishing">
        <Select label="Status" name="status" defaultValue={p?.status ?? "DRAFT"} options={Object.entries(productStatusLabel).map(([value, label]) => ({ value, label }))} hint="Draft and Archived are hidden from the website." />
        <Select label="Category" name="categoryId" defaultValue={p?.categoryId ?? ""} options={[{ value: "", label: "No category" }, ...categories.map((c) => ({ value: c.id, label: c.name }))]} />
        <Check label="Featured" name="featured" defaultChecked={p?.featured} hint="Show on the home page." />
        <Check label="New release" name="isNew" defaultChecked={p?.isNew} hint="Adds a 'New' badge." />
        <Text label="Sort order" name="sortOrder" type="number" defaultValue={p?.sortOrder ?? 0} hint="Lower numbers appear first." />
      </Section>
      <Section title="Look & feel">
        <Select label="Icon" name="icon" defaultValue={p?.icon ?? "boxes"} options={iconNames.map((n) => ({ value: n, label: n }))} />
        <Text label="Accent colour" name="accentColor" defaultValue={p?.accentColor ?? "#3478FF"} hint="Hex colour, e.g. #3478FF" />
        <Select label="3D shape" name="visualShape" defaultValue={p?.visualShape ?? "icosahedron"} options={shapeNames.map((n) => ({ value: n, label: n }))} hint="Used in the 3D visualisation on the product page." />
        <MediaField label="Logo" name="logoUrl" defaultValue={p?.logoUrl} />
        <MediaField label="Main screenshot" name="heroImageUrl" defaultValue={p?.heroImageUrl} hint="Without one, a generated interface preview is shown." />
        <MediaField label="Screenshot gallery" name="screenshots" multiple defaultValue={asStringArray(p?.screenshots).join("\n")} />
        <MediaField label="Product video" name="videoUrl" accept="video/*" defaultValue={p?.videoUrl} />
      </Section>
      <Section title="Content">
        <Area label="Features" name="features" mono rows={7} className="sm:col-span-2" defaultValue={asFeatures(p?.features).map((f) => `${f.title} | ${f.description}`).join("\n")} hint="One per line: Title | Description" />
        <Area label="Benefits" name="benefits" rows={4} defaultValue={asStringArray(p?.benefits).join("\n")} hint="One per line" />
        <Area label="Target audience" name="audience" rows={4} defaultValue={asStringArray(p?.audience).join("\n")} hint="One per line" />
      </Section>
      {p && <p className="text-sm text-text-2">Manage this product&apos;s pricing in <a className="text-cyan" href="/admin/plans">Pricing plans</a> and its questions in <a className="text-cyan" href="/admin/faqs">FAQs</a>.</p>}
    </AdminForm>
  );
}
