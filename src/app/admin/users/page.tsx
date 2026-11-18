import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { createUser, deleteUser, setUserRole } from "../actions";
import { PageHeader, noticeFrom } from "@/components/admin/PageHeader";
import { AdminForm, ConfirmSubmit } from "@/components/admin/AdminForm";
import { Section, Select, Text } from "@/components/admin/Fields";

export const metadata = { title: "Users" };

export default async function Users({ searchParams }: { searchParams: Promise<{ saved?: string; deleted?: string; error?: string }> }) {
  const [sp, me, users] = await Promise.all([searchParams, getSession(), prisma.user.findMany({ orderBy: [{ role: "asc" }, { createdAt: "desc" }] })]);
  return (
    <div className="max-w-4xl">
      <PageHeader title="Users" description="Administrators can manage everything. Customers can only see their own account." notice={noticeFrom(sp)} />
      {sp.error === "self" && <p role="alert" className="mb-6 rounded-xl border border-danger/40 bg-danger/10 p-3 text-sm text-danger">You can&apos;t change or delete your own account here.</p>}
      <ul className="glass divide-y divide-white/5 rounded-2xl">
        {users.map((u) => (
          <li key={u.id} className="flex flex-wrap items-center gap-4 p-4">
            <div className="min-w-0 flex-1">
              <p className="font-medium">{u.name} {u.id === me?.sub && <span className="text-xs text-muted">(you)</span>}</p>
              <p className="truncate text-sm text-text-2">{u.email}</p>
            </div>
            <span className={u.role === "ADMIN" ? "rounded-full bg-cyan/15 px-2.5 py-1 text-xs text-cyan" : "rounded-full bg-white/10 px-2.5 py-1 text-xs text-text-2"}>{u.role.toLowerCase()}</span>
            {u.id !== me?.sub && (
              <div className="flex gap-2">
                <form action={setUserRole}>
                  <input type="hidden" name="id" value={u.id} />
                  <input type="hidden" name="role" value={u.role === "ADMIN" ? "CUSTOMER" : "ADMIN"} />
                  <ConfirmSubmit message={u.role === "ADMIN" ? `Remove admin access from ${u.email}?` : `Give ${u.email} full admin access?`} className="min-h-9 rounded-lg border border-white/10 px-3 text-xs text-text-2 hover:text-text">{u.role === "ADMIN" ? "Make customer" : "Make admin"}</ConfirmSubmit>
                </form>
                <form action={deleteUser}>
                  <input type="hidden" name="id" value={u.id} />
                  <ConfirmSubmit message={`Delete ${u.email}?`} className="min-h-9 rounded-lg border border-white/10 px-3 text-xs text-text-2 hover:border-danger/40 hover:text-danger">Delete</ConfirmSubmit>
                </form>
              </div>
            )}
          </li>
        ))}
      </ul>
      <div className="mt-10">
        <AdminForm action={createUser} submitLabel="Create user">
          <Section title="Add a user">
            <Text label="Name" name="name" required />
            <Text label="Email" name="email" type="email" required />
            <Text label="Temporary password" name="password" type="password" hint="At least 10 characters. Ask them to keep it private." />
            <Select label="Role" name="role" defaultValue="ADMIN" options={[{ value: "ADMIN", label: "Administrator" }, { value: "CUSTOMER", label: "Customer" }]} />
          </Section>
        </AdminForm>
      </div>
    </div>
  );
}
