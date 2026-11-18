import { prisma } from "@/lib/db";
import { deleteTestimonial, saveTestimonial } from "../actions";
import { PageHeader, noticeFrom, Empty } from "@/components/admin/PageHeader";
import { AdminForm } from "@/components/admin/AdminForm";
import { Area, Check, Section, Text } from "@/components/admin/Fields";
import { MediaField } from "@/components/admin/MediaField";
import { RowActions, EditorPanel } from "@/components/admin/RowActions";

export const metadata = { title: "Testimonials" };

export default async function Testimonials({ searchParams }: { searchParams: Promise<{ edit?: string; new?: string; saved?: string; deleted?: string }> }) {
  const sp = await searchParams;
  const items = await prisma.testimonial.findMany({ orderBy: { sortOrder: "asc" } });
  const e = sp.edit ? items.find((t) => t.id === sp.edit) : undefined;
  return (
    <div className="max-w-4xl">
      <PageHeader title="Testimonials" description="Only publish real customer quotes. Keep 'Sample content' ticked on placeholders so visitors see the label." newHref="/admin/testimonials?new=1" newLabel="Add testimonial" notice={noticeFrom(sp)} />
      {(e || sp.new === "1") && (
        <EditorPanel title={e ? "Edit testimonial" : "New testimonial"} closeHref="/admin/testimonials">
          <AdminForm key={e?.id ?? "new"} action={saveTestimonial}>
            {e && <input type="hidden" name="id" value={e.id} />}
            <Section title="Testimonial">
              <Text label="Name" name="name" defaultValue={e?.name} required />
              <Text label="Role" name="role" defaultValue={e?.role} />
              <Text label="Company" name="company" defaultValue={e?.company} />
              <Text label="Rating (1–5)" name="rating" type="number" defaultValue={e?.rating ?? 5} />
              <Area label="Quote" name="quote" defaultValue={e?.quote} rows={4} className="sm:col-span-2" />
              <MediaField label="Avatar" name="avatarUrl" defaultValue={e?.avatarUrl} />
              <Text label="Sort order" name="sortOrder" type="number" defaultValue={e?.sortOrder ?? 0} />
              <div className="grid gap-3">
                <Check label="Sample content" name="isSample" defaultChecked={e?.isSample ?? true} hint="Shows a visible 'Sample content' label." />
                <Check label="Published" name="published" defaultChecked={e?.published ?? true} />
              </div>
            </Section>
          </AdminForm>
        </EditorPanel>
      )}
      {items.length === 0 ? <Empty>No testimonials yet.</Empty> : (
        <ul className="glass divide-y divide-white/5 rounded-2xl">
          {items.map((t) => (
            <li key={t.id} className="flex items-center gap-4 p-4">
              <div className="min-w-0 flex-1">
                <p className="font-medium">{t.name} <span className="text-sm font-normal text-muted">{[t.role, t.company].filter(Boolean).join(", ")}</span></p>
                <p className="truncate text-sm text-text-2">{t.quote}</p>
                <p className="mt-1 flex gap-2 text-xs">{t.isSample && <span className="text-warning">Sample</span>}{!t.published && <span className="text-muted">Unpublished</span>}</p>
              </div>
              <RowActions editHref={`/admin/testimonials?edit=${t.id}`} id={t.id} label={t.name} del={deleteTestimonial} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
