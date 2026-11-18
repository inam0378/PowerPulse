import { ButtonLink } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <div className="container-pp flex min-h-[70vh] flex-col items-center justify-center pt-28 text-center">
      <p className="text-gradient font-display text-8xl font-semibold">404</p>
      <h1 className="mt-4 font-display text-3xl font-semibold">This page isn&apos;t here</h1>
      <p className="mt-3 max-w-md text-text-2">It may have moved, or the product may no longer be available.</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3"><ButtonLink href="/">Back home</ButtonLink><ButtonLink href="/software" variant="secondary">Browse software</ButtonLink></div>
    </div>
  );
}
