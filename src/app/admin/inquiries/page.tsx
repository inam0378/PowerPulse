import { Check, Mail, RotateCcw, Trash2 } from "lucide-react";
import { prisma } from "@/lib/db";
import { deleteInquiry, toggleInquiry } from "../actions";
import { PageHeader, noticeFrom, Empty } from "@/components/admin/PageHeader";
import { ConfirmSubmit } from "@/components/admin/AdminForm";
import clsx from "clsx";

export const metadata = { title: "Inquiries" };
const types = ["ALL", "SALES", "DEMO", "PARTNERSHIP", "SUPPORT", "GENERAL"] as const;

export default async function Inquiries({ searchParams }: { searchParams: Promise<{ type?: string; show?: string; deleted?: string }> }) {
  const sp = await searchParams;
  const type = types.includes(sp.type as (typeof types)[number]) ? sp.type! : "ALL";
  const showAll = sp.show === "all";
  const items = await prisma.inquiry.findMany({
    where: { ...(type !== "ALL" && { type: type as "SALES" }), ...(!showAll && { handled: false }) },
    orderBy: { createdAt: "desc" }, take: 200, include: { product: { select: { name: true } } },
  });
  const q = (t: string, s: boolean) => `/admin/inquiries?type=${t}${s ? "&show=all" : ""}`;
  return (
    <div className="max-w-5xl">
      <PageHeader title="Inquiries" description="Contact messages, demo requests and plan requests from the website." notice={noticeFrom(sp)} />
      <div className="mb-6 flex flex-wrap gap-2">
        {types.map((t) => <a key={t} href={q(t, showAll)} className={clsx("min-h-10 rounded-full border px-4 py-2 text-sm", t === type ? "border-cyan/50 bg-cyan/10 text-text" : "border-white/10 text-text-2 hover:text-text")}>{t === "ALL" ? "All types" : t.charAt(0) + t.slice(1).toLowerCase()}</a>)}
        <a href={q(type, !showAll)} className="ml-auto min-h-10 rounded-full border border-white/10 px-4 py-2 text-sm text-text-2 hover:text-text">{showAll ? "Hide handled" : "Show handled"}</a>
      </div>
      {items.length === 0 ? <Empty>Nothing here. You&apos;re all caught up.</Empty> : (
        <ul className="space-y-3">
          {items.map((i) => (
            <li key={i.id} className={clsx("glass rounded-2xl p-5", i.handled && "opacity-60")}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-medium">{i.name}{i.company && <span className="font-normal text-text-2"> · {i.company}</span>}</p>
                  <a href={`mailto:${i.email}`} className="inline-flex items-center gap-1.5 text-sm break-all text-cyan"><Mail className="size-3.5" aria-hidden="true" />{i.email}</a>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="rounded-full bg-white/10 px-2.5 py-1">{i.type.toLowerCase()}</span>
                  {i.product && <span className="rounded-full bg-blue/15 px-2.5 py-1 text-[#8fb4ff]">{i.product.name}</span>}
                  {i.planName && <span className="rounded-full bg-royal/20 px-2.5 py-1 text-[#b6b2ff]">{i.planName}</span>}
                  <time className="text-muted" dateTime={i.createdAt.toISOString()}>{i.createdAt.toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" })}</time>
                </div>
              </div>
              <p className="mt-3 whitespace-pre-line text-text-2">{i.message}</p>
              <div className="mt-4 flex gap-2">
                <form action={toggleInquiry}>
                  <input type="hidden" name="id" value={i.id} />
                  <button type="submit" className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-white/10 px-3 text-sm text-text-2 hover:text-text">
                    {i.handled ? <><RotateCcw className="size-4" aria-hidden="true" />Reopen</> : <><Check className="size-4" aria-hidden="true" />Mark handled</>}
                  </button>
                </form>
                <form action={deleteInquiry}>
                  <input type="hidden" name="id" value={i.id} />
                  <ConfirmSubmit message="Delete this inquiry?" className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-white/10 px-3 text-sm text-text-2 hover:border-danger/40 hover:text-danger"><Trash2 className="size-4" aria-hidden="true" />Delete</ConfirmSubmit>
                </form>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
