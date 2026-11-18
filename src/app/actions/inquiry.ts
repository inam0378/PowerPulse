"use server";
import { z } from "zod";
import { headers } from "next/headers";
import { prisma } from "@/lib/db";

const schema = z.object({
  type: z.enum(["SALES", "PARTNERSHIP", "SUPPORT", "DEMO", "GENERAL"]),
  name: z.string().trim().min(2, "Please enter your name").max(120),
  email: z.string().trim().email("Please enter a valid email").max(200),
  company: z.string().trim().max(160).optional().default(""),
  message: z.string().trim().min(10, "Please write at least 10 characters").max(5000),
  productSlug: z.string().trim().max(120).optional(),
  planName: z.string().trim().max(120).optional().default(""),
  website: z.string().max(0).optional(), // honeypot: must stay empty
});

export type InquiryState = { ok: boolean; message: string; errors?: Record<string, string> };

// Simple in-memory throttle per IP (best-effort on serverless).
const hits = new Map<string, number[]>();

export async function submitInquiry(_prev: InquiryState, form: FormData): Promise<InquiryState> {
  const parsed = schema.safeParse(Object.fromEntries(form));
  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const issue of parsed.error.issues) errors[String(issue.path[0])] ??= issue.message;
    if (errors.website) return { ok: true, message: "Thanks, your message has been received." };
    return { ok: false, message: "Please fix the highlighted fields.", errors };
  }
  const ip = (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < 10 * 60_000);
  if (recent.length >= 5) return { ok: false, message: "Too many messages in a short time. Please try again in a few minutes." };
  hits.set(ip, [...recent, now]);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { productSlug, website, ...data } = parsed.data;
  const product = productSlug ? await prisma.product.findUnique({ where: { slug: productSlug }, select: { id: true } }) : null;
  await prisma.inquiry.create({ data: { ...data, productId: product?.id } });
  return { ok: true, message: "Thanks! Your message has been saved and our team will reply by email." };
}
