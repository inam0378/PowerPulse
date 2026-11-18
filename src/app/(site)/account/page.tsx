import type { Metadata } from "next";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { logout } from "@/app/actions/auth";
import { Button, ButtonLink } from "@/components/ui/Button";

export const metadata: Metadata = { title: "Your account", robots: { index: false } };

export default async function AccountPage({ searchParams }: { searchParams: Promise<{ welcome?: string }> }) {
  const [session, { welcome }] = await Promise.all([requireUser(), searchParams]);
  const requests = await prisma.inquiry.findMany({ where: { email: session.email }, orderBy: { createdAt: "desc" }, include: { product: { select: { name: true } } } });
  return (
    <div className="container-pp max-w-3xl pt-32 pb-12">
      {welcome && <p role="status" className="mb-6 rounded-xl border border-success/30 bg-success/10 p-4 text-sm text-success">Your account is ready. If you chose a plan, your request has been recorded.</p>}
      <h1 className="font-display text-4xl font-semibold">Hi, {session.name.split(" ")[0]}</h1>
      <p className="mt-2 text-text-2">{session.email}</p>

      <section className="glass mt-10 rounded-2xl p-6">
        <h2 className="font-display text-xl font-semibold">Subscriptions</h2>
        <p className="mt-2 text-sm text-text-2">You have no active subscriptions yet. Online billing is being set up, so our team activates subscriptions manually after you request one.</p>
        <ButtonLink href="/pricing" variant="secondary" size="sm" className="mt-4">Browse plans</ButtonLink>
      </section>

      <section className="glass mt-6 rounded-2xl p-6">
        <h2 className="font-display text-xl font-semibold">Your requests</h2>
        {requests.length === 0 ? <p className="mt-2 text-sm text-text-2">No requests yet.</p> : (
          <ul className="mt-4 divide-y divide-white/10">
            {requests.map((r) => (
              <li key={r.id} className="flex flex-col gap-1 py-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-medium">{r.planName || r.type.charAt(0) + r.type.slice(1).toLowerCase()}{r.product && <span className="text-text-2"> · {r.product.name}</span>}</p>
                  <p className="text-xs text-muted">{r.createdAt.toLocaleDateString("en-US", { dateStyle: "medium" })}</p>
                </div>
                <span className={r.handled ? "text-sm text-success" : "text-sm text-warning"}>{r.handled ? "Handled" : "Awaiting our team"}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <form action={logout} className="mt-8"><Button variant="secondary" type="submit">Sign out</Button></form>
    </div>
  );
}
