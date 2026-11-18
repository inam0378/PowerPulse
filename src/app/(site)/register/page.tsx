import type { Metadata } from "next";
import Link from "next/link";
import { RegisterForm } from "@/components/sections/AuthForms";
import { LogoMark } from "@/components/layout/Logo";
import { prisma } from "@/lib/db";

export const metadata: Metadata = { title: "Create account", robots: { index: false } };

export default async function RegisterPage({ searchParams }: { searchParams: Promise<{ plan?: string; billing?: string; product?: string }> }) {
  const { plan, billing, product } = await searchParams;
  const productRow = product ? await prisma.product.findUnique({ where: { slug: product }, select: { name: true, slug: true } }) : null;
  return (
    <div className="container-pp flex min-h-[80vh] items-center justify-center pt-28">
      <div className="glass w-full max-w-md rounded-[1.5rem] p-8">
        <LogoMark className="size-10" />
        <h1 className="mt-6 font-display text-3xl font-semibold">Create your account</h1>
        {plan ? (
          <div className="mt-4 rounded-xl border border-cyan/25 bg-cyan/5 p-4 text-sm">
            <p className="text-text">Selected: <strong>{plan}</strong>{billing && <> · {billing === "yearly" ? "Yearly" : "Monthly"} billing</>}</p>
            <p className="mt-1 text-text-2">{productRow ? `For ${productRow.name} only.` : "Ecosystem plan."}</p>
            <p className="mt-2 text-xs text-muted">Online payment is not live yet. We&apos;ll record your request and our team will contact you to activate it. You won&apos;t be charged now.</p>
          </div>
        ) : (
          <p className="mt-2 text-text-2">Create an account to request subscriptions and manage your PowerPulse products.</p>
        )}
        <div className="mt-8"><RegisterForm plan={plan} billing={billing} product={productRow?.slug} /></div>
        <p className="mt-6 text-center text-sm text-text-2">Already have an account? <Link href="/login" className="font-semibold text-cyan hover:underline">Sign in</Link></p>
      </div>
    </div>
  );
}
