import Link from "next/link";
import { Pencil, Star, Trash2 } from "lucide-react";
import { prisma } from "@/lib/db";
import { deleteProduct, quickProductStatus } from "../actions";
import { PageHeader, noticeFrom, Empty } from "@/components/admin/PageHeader";
import { ConfirmSubmit } from "@/components/admin/AdminForm";
import { Icon } from "@/components/ui/Icon";
import { productStatusLabel } from "@/lib/format";

export const metadata = { title: "Products" };

export default async function AdminProducts({ searchParams }: { searchParams: Promise<{ saved?: string; deleted?: string }> }) {
  const sp = await searchParams;
  const products = await prisma.product.findMany({ orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }], include: { category: true, _count: { select: { plans: true } } } });
  return (
    <div>
      <PageHeader title="Products" description="Add, edit, publish or archive software products. Only Published, In development and Coming soon products appear on the website." newHref="/admin/products/new" newLabel="Add product" notice={noticeFrom(sp)} />
      {products.length === 0 ? <Empty>No products yet. Add your first product.</Empty> : (
        <div className="glass overflow-x-auto rounded-2xl">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="border-b border-white/10 text-text-2">
              <tr><th className="p-4 font-medium">Product</th><th className="p-4 font-medium">Category</th><th className="p-4 font-medium">Status</th><th className="p-4 font-medium">Plans</th><th className="p-4 font-medium sr-only">Actions</th></tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {products.map((p) => (
                <tr key={p.id} className="hover:bg-white/[0.02]">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <span className="grid size-9 shrink-0 place-items-center rounded-lg" style={{ background: `${p.accentColor}22`, color: p.accentColor }}><Icon name={p.icon} className="size-4" /></span>
                      <div>
                        <p className="font-medium">{p.name} {p.featured && <Star className="inline size-3.5 fill-warning text-warning" aria-label="Featured" />}</p>
                        <p className="text-xs text-muted">/software/{p.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-text-2">{p.category?.name ?? "N/A"}</td>
                  <td className="p-4">
                    <form action={quickProductStatus} className="flex items-center gap-2">
                      <input type="hidden" name="id" value={p.id} />
                      <select name="status" defaultValue={p.status} aria-label={`Status of ${p.name}`} className="field min-h-9 w-40 py-1.5 text-sm">
                        {Object.entries(productStatusLabel).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                      </select>
                      <button type="submit" className="rounded-lg border border-white/10 px-2.5 py-1.5 text-xs text-text-2 hover:text-text">Set</button>
                    </form>
                  </td>
                  <td className="p-4 tabular-nums text-text-2">{p._count.plans}</td>
                  <td className="p-4">
                    <div className="flex justify-end gap-1">
                      <Link href={`/admin/products/${p.id}`} className="grid size-9 place-items-center rounded-lg text-text-2 hover:bg-white/10 hover:text-text" aria-label={`Edit ${p.name}`}><Pencil className="size-4" /></Link>
                      <form action={deleteProduct}>
                        <input type="hidden" name="id" value={p.id} />
                        <ConfirmSubmit message={`Delete ${p.name}? Its plans and FAQs are deleted too.`} className="grid size-9 place-items-center rounded-lg text-text-2 hover:bg-danger/15 hover:text-danger"><Trash2 className="size-4" aria-label={`Delete ${p.name}`} /></ConfirmSubmit>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
