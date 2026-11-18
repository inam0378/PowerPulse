import Link from "next/link";
import { Plus } from "lucide-react";
import { buttonClass } from "../ui/Button";

export function PageHeader({ title, description, newHref, newLabel = "Add new", notice }: { title: string; description?: string; newHref?: string; newLabel?: string; notice?: string | null }) {
  return (
    <div className="mb-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-semibold">{title}</h1>
          {description && <p className="mt-1 max-w-2xl text-text-2">{description}</p>}
        </div>
        {newHref && <Link href={newHref} className={buttonClass("primary", "md")}><Plus className="size-4" aria-hidden="true" />{newLabel}</Link>}
      </div>
      {notice && <p role="status" className="mt-5 rounded-xl border border-success/30 bg-success/10 px-4 py-3 text-sm text-success">{notice}</p>}
    </div>
  );
}

export function noticeFrom(sp: { saved?: string; deleted?: string }) {
  return sp.saved ? "Saved. The public website is updated." : sp.deleted ? "Deleted." : null;
}

export function Empty({ children }: { children: React.ReactNode }) {
  return <p className="glass rounded-2xl p-10 text-center text-text-2">{children}</p>;
}
