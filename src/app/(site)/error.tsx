"use client";
import { Button } from "@/components/ui/Button";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="container-pp flex min-h-[70vh] flex-col items-center justify-center pt-28 text-center">
      <h1 className="font-display text-3xl font-semibold">Something went wrong</h1>
      <p className="mt-3 max-w-md text-text-2">Please try again. If it keeps happening, contact support.</p>
      <Button className="mt-8" onClick={reset}>Try again</Button>
    </div>
  );
}
