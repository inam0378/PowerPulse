"use client";
import { useState } from "react";
import { Check, Copy } from "lucide-react";
import clsx from "clsx";

export function CopyButton({ text, label = "Copy", className }: { text: string; label?: string; className?: string }) {
  const [done, setDone] = useState(false);
  const copy = async () => {
    try { await navigator.clipboard.writeText(text); }
    catch {
      const t = document.createElement("textarea"); t.value = text; document.body.appendChild(t); t.select();
      try { document.execCommand("copy"); } catch {} t.remove();
    }
    setDone(true); setTimeout(() => setDone(false), 1800);
  };
  return (
    <button type="button" onClick={copy} className={clsx("inline-flex min-h-10 items-center gap-1.5 rounded-full border border-white/15 px-4 text-sm font-medium text-text transition-colors hover:border-white/30 hover:bg-white/5", className)}>
      {done ? <Check className="size-4 text-success" aria-hidden="true" /> : <Copy className="size-4" aria-hidden="true" />}
      {done ? "Copied" : label}
    </button>
  );
}
