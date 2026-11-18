import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6 text-center">
      <p className="text-gradient font-display text-8xl font-semibold">404</p>
      <h1 className="mt-4 font-display text-3xl font-semibold">Page not found</h1>
      <Link href="/" className="mt-6 text-cyan">Go to the homepage</Link>
    </div>
  );
}
