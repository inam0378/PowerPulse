import type { Metadata } from "next";
import Link from "next/link";
import { LoginForm } from "@/components/sections/AuthForms";
import { LogoMark } from "@/components/layout/Logo";

export const metadata: Metadata = { title: "Sign in", robots: { index: false } };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  return (
    <div className="container-pp flex min-h-[80vh] items-center justify-center pt-28">
      <div className="glass w-full max-w-md rounded-[1.5rem] p-8">
        <LogoMark className="size-10" />
        <h1 className="mt-6 font-display text-3xl font-semibold">Sign in</h1>
        <p className="mt-2 text-text-2">Customers and administrators sign in here.</p>
        <div className="mt-8"><LoginForm next={next} /></div>
        <p className="mt-6 text-center text-sm text-text-2">No account yet? <Link href="/register" className="font-semibold text-cyan hover:underline">Create one</Link></p>
      </div>
    </div>
  );
}
