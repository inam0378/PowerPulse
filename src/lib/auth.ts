import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "./db";
import { SESSION_COOKIE, SESSION_MAX_AGE, signSession, verifySession, type SessionPayload } from "./session";

export async function getSession() {
  const store = await cookies();
  const session = await verifySession(store.get(SESSION_COOKIE)?.value);
  if (!session) return null;
  // Confirm the user still exists and the role has not changed since login.
  const user = await prisma.user.findUnique({ where: { id: session.sub }, select: { id: true, role: true, email: true, name: true } });
  if (!user) return null;
  return { sub: user.id, email: user.email, name: user.name, role: user.role } satisfies SessionPayload;
}

export async function createSession(payload: SessionPayload) {
  const store = await cookies();
  store.set(SESSION_COOKIE, await signSession(payload), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
}

export async function destroySession() {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}

/** Use at the top of every admin server action and admin API route. */
export async function requireAdmin() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") redirect("/login?next=/admin");
  return session;
}

export async function requireUser() {
  const session = await getSession();
  if (!session) redirect("/login?next=/account");
  return session;
}
