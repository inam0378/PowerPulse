"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { kindOf, makeLicenseKey } from "@/lib/license";
import type { FormState } from "../actions";

const str = (f: FormData, k: string) => String(f.get(k) ?? "").trim();

export async function issueLicense(_: FormState, f: FormData): Promise<FormState> {
  const session = await requireAdmin();
  let id = "";
  try {
    const mc = str(f, "machineCode").toUpperCase().replace(/\s+/g, "");
    const kind = kindOf(mc);
    if (!kind) return { error: "Machine code is not valid. Laptop/PC codes look like RP-1A2B-3C4D-5E6F, tablet codes like RT-1A2B-3C4D-5E6F, DoodhPulse (milk shop) codes like MD-1A2B-3C4D-5E6F." };
    const name = str(f, "name").slice(0, 60);
    if (!name) return { error: "Enter the restaurant or shop name." };
    const dev = kind !== "PC" ? 1 : Math.max(1, Math.min(50, Number.parseInt(str(f, "devices"), 10) || 2));
    const v = str(f, "validity") || "L";
    let exp: string | null = null;
    if (v === "date") {
      exp = str(f, "until");
      if (!/^\d{4}-\d{2}-\d{2}$/.test(exp) || Number.isNaN(Date.parse(exp))) return { error: "Choose the last valid date." };
      if (exp < new Date().toISOString().slice(0, 10)) return { error: "The last valid date is in the past." };
    } else if (/^\d+$/.test(v)) {
      const d = new Date(); d.setMonth(d.getMonth() + Number(v)); exp = d.toISOString().slice(0, 10);
    } else if (v !== "L") return { error: "Choose how long the license is valid." };
    const key = makeLicenseKey({ mc, name, dev, exp });
    const row = await prisma.license.create({
      data: { kind, machineCode: mc, name, devices: dev, expires: exp, phone: str(f, "phone").replace(/[^\d+]/g, "").slice(0, 20), note: str(f, "note").slice(0, 300), key, issuedBy: session.name || session.email },
    });
    id = row.id;
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Something went wrong." };
  }
  revalidatePath("/admin/licenses");
  redirect(`/admin/licenses?issued=${id}`);
}
