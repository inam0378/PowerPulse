"use server";
// Every admin mutation goes through here. Each action re-checks the admin role
// on the server, validates input with zod and then redirects back to a list.
import { z } from "zod";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { slugify } from "@/lib/format";
import { siteDefaults, type SiteKey } from "@/lib/site-defaults";

export type FormState = { error?: string };

// ───────── parsing helpers ─────────
const str = (f: FormData, k: string) => String(f.get(k) ?? "").trim();
const optStr = (f: FormData, k: string) => str(f, k) || null;
const bool = (f: FormData, k: string) => f.get(k) === "on" || f.get(k) === "true";
const int = (f: FormData, k: string) => Number.parseInt(str(f, k) || "0", 10) || 0;
const lines = (f: FormData, k: string) => str(f, k).split("\n").map((l) => l.trim()).filter(Boolean);
/** "12.50" → 1250 cents; empty → null */
const cents = (f: FormData, k: string) => {
  const v = str(f, k);
  if (!v) return null;
  const n = Number(v.replace(/[^0-9.]/g, ""));
  if (!Number.isFinite(n) || n < 0) throw new Error(`Invalid price in "${k}"`);
  return Math.round(n * 100);
};
const pairs = (f: FormData, k: string, sep: string) =>
  lines(f, k).map((l) => {
    const i = l.indexOf(sep);
    return i === -1 ? [l, ""] : [l.slice(0, i).trim(), l.slice(i + sep.length).trim()];
  });
const url = z.string().refine((v) => v.startsWith("/") || /^https?:\/\//.test(v), "Must be a URL or a /path");
const hex = z.string().regex(/^#[0-9a-fA-F]{6}$/, "Colour must be a 6-digit hex like #3478FF");

function done(paths: string[], to: string): never {
  for (const p of paths) revalidatePath(p);
  revalidatePath("/", "layout");
  redirect(to);
}

async function guard<T>(fn: () => Promise<T>): Promise<T | FormState> {
  await requireAdmin();
  try {
    return await fn();
  } catch (e) {
    // redirect() works by throwing, so let it through.
    if (e && typeof e === "object" && "digest" in e && String((e as { digest: unknown }).digest).startsWith("NEXT_REDIRECT")) throw e;
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") return { error: "That slug or email is already in use. Choose another." };
    if (e instanceof z.ZodError) return { error: e.issues.map((i) => i.message).join(" · ") };
    return { error: e instanceof Error ? e.message : "Something went wrong." };
  }
}

// ───────── Products ─────────
const productStatus = z.enum(["PUBLISHED", "DRAFT", "IN_DEVELOPMENT", "COMING_SOON", "ARCHIVED"]);

export async function saveProduct(_: FormState, f: FormData): Promise<FormState> {
  return guard(async () => {
    const id = str(f, "id");
    const name = z.string().min(2, "Name is required").max(120).parse(str(f, "name"));
    const logoUrl = optStr(f, "logoUrl"), heroImageUrl = optStr(f, "heroImageUrl"), videoUrl = optStr(f, "videoUrl");
    for (const u of [logoUrl, heroImageUrl, videoUrl]) if (u) url.parse(u);
    const screenshots = lines(f, "screenshots");
    screenshots.forEach((s) => url.parse(s));
    const data = {
      name,
      slug: slugify(str(f, "slug") || name),
      tagline: str(f, "tagline"),
      shortDescription: str(f, "shortDescription"),
      overview: str(f, "overview"),
      logoUrl, heroImageUrl, videoUrl,
      icon: str(f, "icon") || "boxes",
      accentColor: hex.parse(str(f, "accentColor") || "#3478FF"),
      visualShape: str(f, "visualShape") || "icosahedron",
      status: productStatus.parse(str(f, "status")),
      featured: bool(f, "featured"),
      isNew: bool(f, "isNew"),
      sortOrder: int(f, "sortOrder"),
      categoryId: optStr(f, "categoryId"),
      features: pairs(f, "features", "|").map(([title, description]) => ({ title, description })),
      benefits: lines(f, "benefits"),
      audience: lines(f, "audience"),
      screenshots,
    };
    if (!data.slug) throw new Error("Slug is required");
    if (id) await prisma.product.update({ where: { id }, data });
    else await prisma.product.create({ data });
    done(["/software", `/software/${data.slug}`, "/admin/products"], "/admin/products?saved=1");
  });
}

export async function deleteProduct(f: FormData) {
  await requireAdmin();
  await prisma.product.delete({ where: { id: str(f, "id") } });
  done(["/software", "/admin/products"], "/admin/products?deleted=1");
}

export async function quickProductStatus(f: FormData) {
  await requireAdmin();
  await prisma.product.update({ where: { id: str(f, "id") }, data: { status: productStatus.parse(str(f, "status")) } });
  done(["/software"], "/admin/products");
}

// ───────── Categories ─────────
export async function saveCategory(_: FormState, f: FormData): Promise<FormState> {
  return guard(async () => {
    const id = str(f, "id");
    const name = z.string().min(2, "Name is required").max(80).parse(str(f, "name"));
    const data = { name, slug: slugify(str(f, "slug") || name), description: str(f, "description"), icon: str(f, "icon") || "boxes", sortOrder: int(f, "sortOrder") };
    if (id) await prisma.category.update({ where: { id }, data });
    else await prisma.category.create({ data });
    done(["/software"], "/admin/categories?saved=1");
  });
}

export async function deleteCategory(f: FormData) {
  await requireAdmin();
  await prisma.category.delete({ where: { id: str(f, "id") } });
  done(["/software"], "/admin/categories?deleted=1");
}

// ───────── Plans ─────────
export async function savePlan(_: FormState, f: FormData): Promise<FormState> {
  return guard(async () => {
    const id = str(f, "id");
    const scope = z.enum(["ECOSYSTEM", "PRODUCT"]).parse(str(f, "scope"));
    const productId = scope === "PRODUCT" ? optStr(f, "productId") : null;
    if (scope === "PRODUCT" && !productId) throw new Error("Choose the product this plan belongs to.");
    const isCustom = bool(f, "isCustom");
    const monthlyCents = isCustom ? null : cents(f, "monthly");
    const yearlyCents = isCustom ? null : cents(f, "yearly");
    if (!isCustom && monthlyCents == null && yearlyCents == null) throw new Error("Enter a monthly or yearly price, or mark the plan as custom pricing.");
    const data = {
      name: z.string().min(1, "Name is required").max(60).parse(str(f, "name")),
      description: str(f, "description"), scope, productId, monthlyCents, yearlyCents,
      currency: (str(f, "currency") || "USD").toUpperCase().slice(0, 3), isCustom,
      highlighted: bool(f, "highlighted"), active: bool(f, "active"),
      features: lines(f, "features"),
      limits: pairs(f, "limits", ":").map(([label, value]) => ({ label, value })),
      productAccess: str(f, "productAccess"), supportLevel: str(f, "supportLevel"),
      ctaLabel: str(f, "ctaLabel") || "Get started", sortOrder: int(f, "sortOrder"),
    };
    if (id) await prisma.plan.update({ where: { id }, data });
    else await prisma.plan.create({ data });
    done(["/pricing"], "/admin/plans?saved=1");
  });
}

export async function deletePlan(f: FormData) {
  await requireAdmin();
  await prisma.plan.delete({ where: { id: str(f, "id") } });
  done(["/pricing"], "/admin/plans?deleted=1");
}

// ───────── Projects ─────────
export async function saveProject(_: FormState, f: FormData): Promise<FormState> {
  return guard(async () => {
    const id = str(f, "id");
    const title = z.string().min(2, "Title is required").max(140).parse(str(f, "title"));
    const imageUrl = optStr(f, "imageUrl");
    if (imageUrl) url.parse(imageUrl);
    const data = {
      title, slug: slugify(str(f, "slug") || title), summary: str(f, "summary"), description: str(f, "description"),
      category: str(f, "category"), status: z.enum(["COMPLETED", "IN_PROGRESS", "UPCOMING", "DEMO"]).parse(str(f, "status")),
      imageUrl, accentColor: hex.parse(str(f, "accentColor") || "#00D4FF"),
      tags: str(f, "tags").split(",").map((t) => t.trim()).filter(Boolean),
      published: bool(f, "published"), sortOrder: int(f, "sortOrder"),
    };
    if (id) await prisma.project.update({ where: { id }, data });
    else await prisma.project.create({ data });
    done(["/projects"], "/admin/projects?saved=1");
  });
}

export async function deleteProject(f: FormData) {
  await requireAdmin();
  await prisma.project.delete({ where: { id: str(f, "id") } });
  done(["/projects"], "/admin/projects?deleted=1");
}

export async function toggleProjectPublished(f: FormData) {
  await requireAdmin();
  const id = str(f, "id");
  const p = await prisma.project.findUniqueOrThrow({ where: { id }, select: { published: true } });
  await prisma.project.update({ where: { id }, data: { published: !p.published } });
  done(["/projects"], "/admin/projects");
}

// ───────── Testimonials ─────────
export async function saveTestimonial(_: FormState, f: FormData): Promise<FormState> {
  return guard(async () => {
    const id = str(f, "id");
    const avatarUrl = optStr(f, "avatarUrl");
    if (avatarUrl) url.parse(avatarUrl);
    const data = {
      name: z.string().min(1, "Name is required").parse(str(f, "name")), role: str(f, "role"), company: str(f, "company"),
      quote: z.string().min(5, "Quote is required").parse(str(f, "quote")), avatarUrl,
      rating: Math.min(5, Math.max(1, int(f, "rating") || 5)), isSample: bool(f, "isSample"),
      published: bool(f, "published"), sortOrder: int(f, "sortOrder"),
    };
    if (id) await prisma.testimonial.update({ where: { id }, data });
    else await prisma.testimonial.create({ data });
    done(["/"], "/admin/testimonials?saved=1");
  });
}

export async function deleteTestimonial(f: FormData) {
  await requireAdmin();
  await prisma.testimonial.delete({ where: { id: str(f, "id") } });
  done(["/"], "/admin/testimonials?deleted=1");
}

// ───────── FAQs ─────────
export async function saveFaq(_: FormState, f: FormData): Promise<FormState> {
  return guard(async () => {
    const id = str(f, "id");
    const data = {
      question: z.string().min(3, "Question is required").parse(str(f, "question")),
      answer: z.string().min(1, "Answer is required").parse(str(f, "answer")),
      productId: optStr(f, "productId"), published: bool(f, "published"), sortOrder: int(f, "sortOrder"),
    };
    if (id) await prisma.faq.update({ where: { id }, data });
    else await prisma.faq.create({ data });
    done(["/", "/pricing"], "/admin/faqs?saved=1");
  });
}

export async function deleteFaq(f: FormData) {
  await requireAdmin();
  await prisma.faq.delete({ where: { id: str(f, "id") } });
  done(["/"], "/admin/faqs?deleted=1");
}

// ───────── Inquiries ─────────
export async function toggleInquiry(f: FormData) {
  await requireAdmin();
  const id = str(f, "id");
  const i = await prisma.inquiry.findUniqueOrThrow({ where: { id }, select: { handled: true } });
  await prisma.inquiry.update({ where: { id }, data: { handled: !i.handled } });
  done([], "/admin/inquiries");
}

export async function deleteInquiry(f: FormData) {
  await requireAdmin();
  await prisma.inquiry.delete({ where: { id: str(f, "id") } });
  done([], "/admin/inquiries?deleted=1");
}

// ───────── Site settings ─────────
export async function saveSetting(_: FormState, f: FormData): Promise<FormState> {
  return guard(async () => {
    const key = str(f, "key") as SiteKey;
    if (!(key in siteDefaults)) throw new Error("Unknown setting");
    const base = siteDefaults[key] as unknown;
    let value: unknown;
    if (typeof base === "string") {
      value = parseJson(str(f, "jsonValue"), key);
      if (typeof value !== "string") throw new Error(`"${key}" must be text wrapped in double quotes`);
    } else if (Array.isArray(base)) {
      value = parseJson(str(f, "jsonValue"), key);
      if (!Array.isArray(value)) throw new Error(`"${key}" must be a JSON list`);
    } else {
      const obj: Record<string, unknown> = {};
      for (const [k, v] of Object.entries(base as Record<string, unknown>)) {
        obj[k] = typeof v === "string" ? str(f, k) : parseJson(str(f, k), `${key}.${k}`);
      }
      value = obj;
    }
    await prisma.setting.upsert({ where: { key }, create: { key, value: value as Prisma.InputJsonValue }, update: { value: value as Prisma.InputJsonValue } });
    done(["/"], `/admin/settings?saved=${key}`);
  });
}

export async function resetSetting(f: FormData) {
  await requireAdmin();
  await prisma.setting.deleteMany({ where: { key: str(f, "key") } });
  done(["/"], "/admin/settings");
}

function parseJson(text: string, label: string) {
  try {
    return JSON.parse(text);
  } catch {
    throw new Error(`"${label}" is not valid JSON. Check commas and quotes.`);
  }
}

// ───────── Users ─────────
export async function createUser(_: FormState, f: FormData): Promise<FormState> {
  return guard(async () => {
    const data = z.object({
      name: z.string().min(2, "Name is required"),
      email: z.string().toLowerCase().email("Valid email required"),
      password: z.string().min(10, "Password must be at least 10 characters"),
      role: z.enum(["ADMIN", "CUSTOMER"]),
    }).parse({ name: str(f, "name"), email: str(f, "email"), password: str(f, "password"), role: str(f, "role") });
    await prisma.user.create({ data: { name: data.name, email: data.email, role: data.role, passwordHash: await bcrypt.hash(data.password, 12) } });
    done([], "/admin/users?saved=1");
  });
}

export async function setUserRole(f: FormData) {
  const me = await requireAdmin();
  const id = str(f, "id");
  if (id === me.sub) redirect("/admin/users?error=self");
  await prisma.user.update({ where: { id }, data: { role: z.enum(["ADMIN", "CUSTOMER"]).parse(str(f, "role")) } });
  done([], "/admin/users");
}

export async function deleteUser(f: FormData) {
  const me = await requireAdmin();
  const id = str(f, "id");
  if (id === me.sub) redirect("/admin/users?error=self");
  await prisma.user.delete({ where: { id } });
  done([], "/admin/users?deleted=1");
}
