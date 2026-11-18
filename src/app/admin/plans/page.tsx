import { prisma } from "@/lib/db";
import { deletePlan, savePlan } from "../actions";
import { PageHeader, noticeFrom } from "@/components/admin/PageHeader";
import { AdminForm } from "@/components/admin/AdminForm";
import { Area, Check, Section, Select, Text } from "@/components/admin/Fields";
import { RowActions, EditorPanel } from "@/components/admin/RowActions";
import { annualSavings, asLimits, asStringArray, formatPrice } from "@/lib/format";

export const metadata = { title: "Pricing plans" };

export default async function Plans({ searchParams }: { searchParams: Promise<{ edit?: string; new?: string; product?: string; saved?: string; deleted?: string }> }) {
  const sp = await searchParams;
  const [plans, products] = await Promise.all([
    prisma.plan.findMany({ orderBy: [{ scope: "asc" }, { sortOrder: "asc" }], include: { product: { select: { name: true } } } }),
    prisma.product.findMany({ orderBy: { sortOrder: "asc" }, select: { id: true, name: true } }),
  ]);
  const editing = sp.edit ? plans.find((p) => p.id === sp.edit) : undefined;
  const showForm = !!editing || sp.new === "1";
  const groups = [
    { key: "eco", title: "Ecosystem plans", items: plans.filter((p) => p.scope === "ECOSYSTEM") },
    ...products.map((pr) => ({ key: pr.id, title: pr.name, items: plans.filter((p) => p.productId === pr.id) })).filter((g) => g.items.length),
  ];
  const price = (c: number | null, cur: string) => formatPrice(c, cur) ?? "N/A";

  return (
    <div className="max-w-5xl">
      <PageHeader title="Pricing plans" description="Ecosystem plans unlock several products. Product plans apply to one product only. Prices are entered in whole currency units (e.g. 49 or 49.99)." newHref="/admin/plans?new=1" newLabel="Add plan" notice={noticeFrom(sp)} />
      {showForm && (
        <EditorPanel title={editing ? `Edit ${editing.name}` : "New plan"} closeHref="/admin/plans">
          <AdminForm key={editing?.id ?? "new"} action={savePlan}>
            {editing && <input type="hidden" name="id" value={editing.id} />}
            <Section title="Plan">
              <Text label="Plan name" name="name" defaultValue={editing?.name} required />
              <Select label="Type" name="scope" defaultValue={editing?.scope ?? (sp.product ? "PRODUCT" : "ECOSYSTEM")} options={[{ value: "ECOSYSTEM", label: "Ecosystem plan (several products)" }, { value: "PRODUCT", label: "Product plan (one product)" }]} />
              <Select label="Product (for product plans)" name="productId" defaultValue={editing?.productId ?? sp.product ?? ""} options={[{ value: "", label: "N/A" }, ...products.map((p) => ({ value: p.id, label: p.name }))]} />
              <Text label="Sort order" name="sortOrder" type="number" defaultValue={editing?.sortOrder ?? 0} />
              <Area label="Description" name="description" defaultValue={editing?.description} rows={2} className="sm:col-span-2" />
            </Section>
            <Section title="Price" description="Annual savings are calculated automatically from these two prices.">
              <Text label="Monthly price" name="monthly" type="number" defaultValue={editing?.monthlyCents != null ? editing.monthlyCents / 100 : ""} placeholder="49" />
              <Text label="Yearly price" name="yearly" type="number" defaultValue={editing?.yearlyCents != null ? editing.yearlyCents / 100 : ""} placeholder="490" />
              <Text label="Currency (ISO code)" name="currency" defaultValue={editing?.currency ?? "USD"} />
              <Check label="Custom pricing" name="isCustom" defaultChecked={editing?.isCustom} hint="Shows 'Custom' and a Contact sales button." />
            </Section>
            <Section title="Details">
              <Text label="Product access" name="productAccess" defaultValue={editing?.productAccess} hint='e.g. "Any 3 PowerPulse products"' />
              <Text label="Support level" name="supportLevel" defaultValue={editing?.supportLevel} />
              <Text label="Button label" name="ctaLabel" defaultValue={editing?.ctaLabel ?? "Get started"} />
              <div className="grid gap-3">
                <Check label="Highlight as most popular" name="highlighted" defaultChecked={editing?.highlighted} />
                <Check label="Active (shown on site)" name="active" defaultChecked={editing?.active ?? true} />
              </div>
              <Area label="Features" name="features" rows={6} defaultValue={asStringArray(editing?.features).join("\n")} hint="One per line" />
              <Area label="Usage limits" name="limits" rows={6} mono defaultValue={asLimits(editing?.limits).map((l) => `${l.label}: ${l.value}`).join("\n")} hint="One per line: Label: Value" />
            </Section>
          </AdminForm>
        </EditorPanel>
      )}
      <div className="space-y-8">
        {groups.map((g) => (
          <section key={g.key}>
            <h2 className="mb-3 font-display text-lg font-semibold">{g.title}</h2>
            <ul className="glass divide-y divide-white/5 rounded-2xl">
              {g.items.map((p) => {
                const s = annualSavings(p.monthlyCents, p.yearlyCents);
                return (
                  <li key={p.id} className="flex flex-wrap items-center gap-4 p-4">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium">{p.name} {p.highlighted && <span className="ml-1 rounded-full bg-cyan/15 px-2 py-0.5 text-xs text-cyan">Popular</span>} {!p.active && <span className="ml-1 rounded-full bg-white/10 px-2 py-0.5 text-xs text-muted">Inactive</span>}</p>
                      <p className="text-sm text-text-2">{p.isCustom ? "Custom pricing" : `${price(p.monthlyCents, p.currency)}/mo · ${price(p.yearlyCents, p.currency)}/yr`}{s && <span className="text-success"> · saves {s.percent}%</span>}</p>
                    </div>
                    <RowActions editHref={`/admin/plans?edit=${p.id}`} id={p.id} label={p.name} del={deletePlan} />
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
