import { KeyRound, Laptop, Tablet, TriangleAlert } from "lucide-react";
import { prisma } from "@/lib/db";
import { PageHeader, Empty } from "@/components/admin/PageHeader";
import { AdminForm } from "@/components/admin/AdminForm";
import { Section, Select, Text } from "@/components/admin/Fields";
import { CopyButton } from "@/components/admin/CopyButton";
import { LICENSE_ENV, signerStatus } from "@/lib/license";
import { issueLicense } from "./actions";

export const metadata = { title: "RestoPulse licenses" };
export const dynamic = "force-dynamic";

const fmt = (d: Date) => d.toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", timeZone: "Asia/Karachi" });
const validity = (e: string | null) => (e ? `until ${new Date(e + "T12:00:00Z").toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}` : "Lifetime");
const KindBadge = ({ kind }: { kind: string }) => (
  <span className={kind === "TABLET" ? "inline-flex items-center gap-1 rounded-md bg-[#ffc800] px-2 py-0.5 text-xs font-bold text-[#0c0b09]" : "inline-flex items-center gap-1 rounded-md bg-cyan px-2 py-0.5 text-xs font-bold text-bg"}>
    {kind === "TABLET" ? <Tablet className="size-3.5" aria-hidden="true" /> : <Laptop className="size-3.5" aria-hidden="true" />}{kind === "TABLET" ? "Tablet" : "Laptop / PC"}
  </span>
);
const waLink = (phone: string, text: string) => {
  let p = phone.replace(/\D/g, "");
  if (p.startsWith("0")) p = "92" + p.slice(1);
  return `https://wa.me/${p}?text=${encodeURIComponent(text)}`;
};

export default async function Licenses({ searchParams }: { searchParams: Promise<{ issued?: string; q?: string }> }) {
  const sp = await searchParams;
  const status = signerStatus();
  const q = (sp.q || "").trim();
  const [rows, issued, counts] = await Promise.all([
    prisma.license.findMany({
      where: q ? { OR: [{ machineCode: { contains: q.toUpperCase() } }, { name: { contains: q, mode: "insensitive" } }, { phone: { contains: q } }] } : undefined,
      orderBy: { createdAt: "desc" }, take: 200,
    }),
    sp.issued ? prisma.license.findUnique({ where: { id: sp.issued } }) : null,
    prisma.license.groupBy({ by: ["kind"], _count: true }),
  ]);
  const count = (k: string) => counts.find((c) => c.kind === k)?._count ?? 0;
  const msg = issued && `RestoPulse ${issued.kind === "TABLET" ? "Tablet " : ""}license for ${issued.name}\nCode: ${issued.machineCode}\n${issued.kind === "TABLET" ? "1 device" : issued.devices + " devices (counter PC included)"} · ${validity(issued.expires)}\n\nLicense key (copy all of it and paste it in RestoPulse → Activate):\n${issued.key}`;

  return (
    <div className="max-w-5xl">
      <PageHeader title="RestoPulse licenses" description="One place to make license keys for both offline versions: laptop / counter PC (codes start with RP-) and tablet / phone (codes start with RT-). Every key you make is saved below." />

      {status !== "ok" && (
        <div role="alert" className="mb-8 rounded-2xl border border-warning/40 bg-warning/10 p-5 text-sm leading-relaxed">
          <p className="flex items-center gap-2 font-semibold text-warning"><TriangleAlert className="size-4" aria-hidden="true" />
            {status === "missing" ? "One-time setup: the signing key is not on the server yet" : status === "mismatch" ? "The signing key on the server does not match RestoPulse" : "The signing key on the server cannot be read"}</p>
          <ol className="mt-3 list-decimal space-y-1 pl-5 text-text-2">
            <li>Open <b className="text-text">license-private.pem</b> from your RestoPulse License Tool folder (Notepad) and copy everything in it.</li>
            <li>Vercel → project <b className="text-text">power-pulse</b> → Settings → Environment Variables → Add.</li>
            <li>Name: <code className="rounded bg-white/10 px-1.5 py-0.5 text-text">{LICENSE_ENV}</code> · Value: paste the file · Environments: Production (and Preview) · Mark it <b className="text-text">Sensitive</b> · Save.</li>
            <li>Deployments → latest → ⋯ → <b className="text-text">Redeploy</b>. Then open this page again.</li>
          </ol>
          <p className="mt-3 text-text-2">The key stays only in Vercel. It is never shown on this page, saved in the database or sent to clients.</p>
        </div>
      )}

      {issued && msg && (
        <section aria-label="New license key" className="mb-8 rounded-2xl border border-success/40 bg-success/10 p-5">
          <p className="flex flex-wrap items-center gap-2 font-semibold text-success"><KeyRound className="size-4" aria-hidden="true" />License key ready <KindBadge kind={issued.kind} /></p>
          <p className="mt-2 text-sm text-text-2">{issued.name} · <span className="font-mono text-text">{issued.machineCode}</span> · {issued.kind === "TABLET" ? "1 device" : `${issued.devices} devices`} · {validity(issued.expires)}</p>
          <textarea readOnly rows={3} value={issued.key} aria-label="License key" className="field mt-3 font-mono text-xs break-all" />
          <div className="mt-3 flex flex-wrap gap-2">
            <CopyButton text={issued.key} label="Copy key" />
            <CopyButton text={msg} label="Copy message for client" />
            {issued.phone && <a href={waLink(issued.phone, msg)} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-10 items-center rounded-full bg-success px-4 text-sm font-semibold text-bg">Send on WhatsApp</a>}
          </div>
        </section>
      )}

      <div className="grid gap-8 lg:grid-cols-[1fr_1fr]">
        <div className="min-w-0">
          <AdminForm action={issueLicense} submitLabel="Make license key">
            <Section title="New license" description="Paste the code the client sees in RestoPulse (Settings → Offline / Tablet, or the Activate screen). RP- = laptop / PC, RT- = tablet / phone.">
              <Text label="Machine / device code" name="machineCode" required placeholder="RP-1A2B-3C4D-5E6F or RT-1A2B-3C4D-5E6F" className="sm:col-span-2" />
              <Text label="Restaurant name" name="name" required placeholder="e.g. Shawarma Point, Johar Town" className="sm:col-span-2" />
              <Select label="Devices (laptop / PC only)" name="devices" defaultValue="2" options={[1, 2, 3, 4, 5, 6, 8, 10, 15, 20].map((n) => ({ value: String(n), label: n === 1 ? "1 · counter PC only" : `${n} · counter PC + ${n - 1}` }))} hint="Tablet licenses are always 1 device." />
              <Select label="Valid for" name="validity" defaultValue="L" options={[{ value: "L", label: "Lifetime" }, { value: "1", label: "1 month" }, { value: "3", label: "3 months" }, { value: "6", label: "6 months" }, { value: "12", label: "1 year" }, { value: "24", label: "2 years" }, { value: "date", label: "Until a date (below)" }]} />
              <Text label="Last valid date (only for “Until a date”)" name="until" type="date" />
              <Text label="Client WhatsApp (optional)" name="phone" placeholder="03xx-xxxxxxx" />
              <Text label="Note (optional)" name="note" placeholder="Paid 15,000 · cash · Nov" className="sm:col-span-2" />
            </Section>
          </AdminForm>
        </div>

        <div className="min-w-0">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-display text-lg font-semibold">Issued keys</h2>
            <p className="text-sm text-text-2">Laptop / PC: <b className="text-text">{count("PC")}</b> · Tablet: <b className="text-text">{count("TABLET")}</b></p>
          </div>
          <form className="mb-3 flex gap-2" action="/admin/licenses">
            <input name="q" defaultValue={q} placeholder="Search code, restaurant or phone" className="field min-w-0 flex-1" />
            <button className="inline-flex min-h-11 items-center rounded-full border border-white/15 px-4 text-sm font-medium">Search</button>
          </form>
          {rows.length === 0 ? <Empty>{q ? "No license matches this search." : "No license keys yet."}</Empty> : (
            <ul className="glass divide-y divide-white/5 rounded-2xl">
              {rows.map((r) => (
                <li key={r.id} className="p-4">
                  <div className="flex flex-wrap items-center gap-2"><KindBadge kind={r.kind} /><b className="min-w-0 truncate">{r.name}</b></div>
                  <p className="mt-1 text-sm text-text-2"><span className="font-mono text-text">{r.machineCode}</span> · {r.kind === "TABLET" ? "1 device" : `${r.devices} devices`} · {validity(r.expires)}</p>
                  <p className="mt-0.5 text-xs text-muted">{fmt(r.createdAt)}{r.issuedBy ? ` · by ${r.issuedBy}` : ""}{r.phone ? ` · ${r.phone}` : ""}{r.note ? ` · ${r.note}` : ""}</p>
                  <div className="mt-2"><CopyButton text={r.key} label="Copy key" /></div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
