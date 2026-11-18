"use server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { createSession, destroySession } from "@/lib/auth";

export type AuthState = { error?: string; errors?: Record<string, string> };

function safeNext(next: unknown, fallback: string) {
  const n = typeof next === "string" ? next : "";
  return n.startsWith("/") && !n.startsWith("//") ? n : fallback;
}

// Real hash of a random string, so unknown emails take as long as wrong passwords.
const DUMMY_HASH = "$2b$12$J.7H4vKemEWyD0ZEjbeD9OyrRgAxV7OQbC4fc9gYHoSvzCdb96rpi";

const attempts = new Map<string, { n: number; until: number }>();

export async function login(_prev: AuthState, form: FormData): Promise<AuthState> {
  const email = String(form.get("email") ?? "").trim().toLowerCase();
  const password = String(form.get("password") ?? "");
  if (!email || !password) return { error: "Enter your email and password." };

  const a = attempts.get(email);
  if (a && a.until > Date.now()) return { error: "Too many attempts. Please wait a few minutes and try again." };

  const user = await prisma.user.findUnique({ where: { email } });
  const ok = user ? await bcrypt.compare(password, user.passwordHash) : await bcrypt.compare(password, DUMMY_HASH);
  if (!user || !ok) {
    const n = (a?.n ?? 0) + 1;
    attempts.set(email, { n, until: n >= 5 ? Date.now() + 5 * 60_000 : 0 });
    return { error: "Email or password is incorrect." };
  }
  attempts.delete(email);
  await createSession({ sub: user.id, email: user.email, name: user.name, role: user.role });
  redirect(safeNext(form.get("next"), user.role === "ADMIN" ? "/admin" : "/account"));
}

const registerSchema = z.object({
  name: z.string().trim().min(2, "Enter your name").max(120),
  email: z.string().trim().toLowerCase().email("Enter a valid email"),
  password: z.string().min(10, "Use at least 10 characters").max(200),
  company: z.string().trim().max(160).optional().default(""),
  plan: z.string().trim().max(120).optional().default(""),
  billing: z.enum(["monthly", "yearly"]).optional(),
  product: z.string().trim().max(120).optional().default(""),
});

export async function register(_prev: AuthState, form: FormData): Promise<AuthState> {
  const parsed = registerSchema.safeParse(Object.fromEntries(form));
  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const i of parsed.error.issues) errors[String(i.path[0])] ??= i.message;
    return { errors };
  }
  const d = parsed.data;
  if (await prisma.user.findUnique({ where: { email: d.email } })) {
    return { errors: { email: "An account with this email already exists. Sign in instead." } };
  }
  // New sign-ups are always customers. Admins are created by the seed or by another admin.
  const user = await prisma.user.create({ data: { email: d.email, name: d.name, role: "CUSTOMER", passwordHash: await bcrypt.hash(d.password, 12) } });

  if (d.plan) {
    const product = d.product ? await prisma.product.findUnique({ where: { slug: d.product }, select: { id: true, name: true } }) : null;
    await prisma.inquiry.create({
      data: {
        type: "SALES", name: d.name, email: d.email, company: d.company, productId: product?.id,
        planName: `${d.plan}${d.billing ? ` (${d.billing})` : ""}`,
        message: `Subscription request from new account: ${d.plan} plan, ${d.billing ?? "monthly"} billing${product ? `, for ${product.name}` : " (ecosystem plan)"}.`,
      },
    });
  }
  await createSession({ sub: user.id, email: user.email, name: user.name, role: "CUSTOMER" });
  redirect("/account?welcome=1");
}

export async function logout() {
  await destroySession();
  redirect("/");
}
