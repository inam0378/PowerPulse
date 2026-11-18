import { prisma } from "@/lib/db";
import { deleteFaq, saveFaq } from "../actions";
import { PageHeader, noticeFrom, Empty } from "@/components/admin/PageHeader";
import { AdminForm } from "@/components/admin/AdminForm";
import { Area, Check, Section, Select, Text } from "@/components/admin/Fields";
import { RowActions, EditorPanel } from "@/components/admin/RowActions";

export const metadata = { title: "FAQs" };

export default async function Faqs({ searchParams }: { searchParams: Promise<{ edit?: string; new?: string; saved?: string; deleted?: string }> }) {
  const sp = await searchParams;
  const [faqs, products] = await Promise.all([
    prisma.faq.findMany({ orderBy: [{ productId: "asc" }, { sortOrder: "asc" }], include: { product: { select: { name: true } } } }),
    prisma.product.findMany({ orderBy: { sortOrder: "asc" }, select: { id: true, name: true } }),
  ]);
  const e = sp.edit ? faqs.find((f) => f.id === sp.edit) : undefined;
  const groups = [{ id: "", name: "General (home & pricing pages)" }, ...products].map((g) => ({ ...g, items: faqs.filter((f) => (f.productId ?? "") === g.id) })).filter((g) => g.items.length);
  return (
    <div className="max-w-4xl">
      <PageHeader title="FAQs" description="General FAQs appear on the home and pricing pages. Product FAQs appear on that product's page." newHref="/admin/faqs?new=1" newLabel="Add FAQ" notice={noticeFrom(sp)} />
      {(e || sp.new === "1") && (
        <EditorPanel title={e ? "Edit FAQ" : "New FAQ"} closeHref="/admin/faqs">
          <AdminForm key={e?.id ?? "new"} action={saveFaq}>
            {e && <input type="hidden" name="id" value={e.id} />}
            <Section title="Question">
              <Text label="Question" name="question" defaultValue={e?.question} required className="sm:col-span-2" />
              <Area label="Answer" name="answer" defaultValue={e?.answer} rows={4} className="sm:col-span-2" />
              <Select label="Shown on" name="productId" defaultValue={e?.productId ?? ""} options={[{ value: "", label: "General (home & pricing)" }, ...products.map((p) => ({ value: p.id, label: p.name }))]} />
              <Text label="Sort order" name="sortOrder" type="number" defaultValue={e?.sortOrder ?? 0} />
              <Check label="Published" name="published" defaultChecked={e?.published ?? true} />
            </Section>
          </AdminForm>
        </EditorPanel>
      )}
      {groups.length === 0 ? <Empty>No FAQs yet.</Empty> : (
        <div className="space-y-8">
          {groups.map((g) => (
            <section key={g.id || "general"}>
              <h2 className="mb-3 font-display text-lg font-semibold">{g.name}</h2>
              <ul className="glass divide-y divide-white/5 rounded-2xl">
                {g.items.map((f) => (
                  <li key={f.id} className="flex items-center gap-4 p-4">
                    <div className="min-w-0 flex-1"><p className="font-medium">{f.question}</p><p className="truncate text-sm text-text-2">{f.answer}</p>{!f.published && <p className="text-xs text-muted">Unpublished</p>}</div>
                    <RowActions editHref={`/admin/faqs?edit=${f.id}`} id={f.id} label={f.question} del={deleteFaq} />
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
