import { prisma } from "@/lib/db";
import { deleteCategory, saveCategory } from "../actions";
import { PageHeader, noticeFrom, Empty } from "@/components/admin/PageHeader";
import { AdminForm } from "@/components/admin/AdminForm";
import { Area, Section, Select, Text } from "@/components/admin/Fields";
import { RowActions, EditorPanel } from "@/components/admin/RowActions";
import { Icon, iconNames } from "@/components/ui/Icon";

export const metadata = { title: "Categories" };

export default async function Categories({ searchParams }: { searchParams: Promise<{ edit?: string; new?: string; saved?: string; deleted?: string }> }) {
  const sp = await searchParams;
  const cats = await prisma.category.findMany({ orderBy: [{ sortOrder: "asc" }, { name: "asc" }], include: { _count: { select: { products: true } } } });
  const editing = sp.edit ? cats.find((c) => c.id === sp.edit) : undefined;
  const showForm = !!editing || sp.new === "1";
  return (
    <div className="max-w-4xl">
      <PageHeader title="Categories" description="Group products for filtering on the software directory." newHref="/admin/categories?new=1" newLabel="Add category" notice={noticeFrom(sp)} />
      {showForm && (
        <EditorPanel title={editing ? `Edit ${editing.name}` : "New category"} closeHref="/admin/categories">
          <AdminForm key={editing?.id ?? "new"} action={saveCategory}>
            {editing && <input type="hidden" name="id" value={editing.id} />}
            <Section title="Category">
              <Text label="Name" name="name" defaultValue={editing?.name} required />
              <Text label="Slug" name="slug" defaultValue={editing?.slug} hint="Leave empty to generate." />
              <Select label="Icon" name="icon" defaultValue={editing?.icon ?? "boxes"} options={iconNames.map((n) => ({ value: n, label: n }))} />
              <Text label="Sort order" name="sortOrder" type="number" defaultValue={editing?.sortOrder ?? 0} />
              <Area label="Description" name="description" defaultValue={editing?.description} rows={2} className="sm:col-span-2" />
            </Section>
          </AdminForm>
        </EditorPanel>
      )}
      {cats.length === 0 ? <Empty>No categories yet.</Empty> : (
        <ul className="glass divide-y divide-white/5 rounded-2xl">
          {cats.map((c) => (
            <li key={c.id} className="flex items-center gap-4 p-4">
              <Icon name={c.icon} className="size-5 shrink-0 text-cyan" />
              <div className="min-w-0 flex-1"><p className="font-medium">{c.name}</p><p className="truncate text-sm text-muted">{c._count.products} products · {c.slug}</p></div>
              <RowActions editHref={`/admin/categories?edit=${c.id}`} id={c.id} label={c.name} del={deleteCategory} />
            </li>
          ))}
        </ul>
      )}
      <p className="mt-4 text-xs text-muted">Deleting a category keeps its products; they simply become uncategorised.</p>
    </div>
  );
}
