import Link from "next/link";
import { Pencil, Trash2 } from "lucide-react";
import { ConfirmSubmit } from "./AdminForm";

export function RowActions({ editHref, id, label, del }: { editHref: string; id: string; label: string; del: (f: FormData) => Promise<void> }) {
  return (
    <div className="flex shrink-0 justify-end gap-1">
      <Link href={editHref} scroll={false} className="grid size-9 place-items-center rounded-lg text-text-2 hover:bg-white/10 hover:text-text" aria-label={`Edit ${label}`}><Pencil className="size-4" /></Link>
      <form action={del}>
        <input type="hidden" name="id" value={id} />
        <ConfirmSubmit message={`Delete "${label}"?`} className="grid size-9 place-items-center rounded-lg text-text-2 hover:bg-danger/15 hover:text-danger"><Trash2 className="size-4" aria-label={`Delete ${label}`} /></ConfirmSubmit>
      </form>
    </div>
  );
}

export function EditorPanel({ title, closeHref, children }: { title: string; closeHref: string; children: React.ReactNode }) {
  return (
    <section className="mb-10 rounded-2xl border border-cyan/25 bg-surface/60 p-5 sm:p-6">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="font-display text-xl font-semibold">{title}</h2>
        <Link href={closeHref} scroll={false} className="text-sm text-text-2 hover:text-text">Cancel</Link>
      </div>
      {children}
    </section>
  );
}
