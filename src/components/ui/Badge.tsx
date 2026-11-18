import clsx from "clsx";
import { productStatusLabel, projectStatusLabel } from "@/lib/format";

const tones: Record<string, string> = {
  PUBLISHED: "text-success border-success/30 bg-success/10",
  COMPLETED: "text-success border-success/30 bg-success/10",
  IN_DEVELOPMENT: "text-warning border-warning/30 bg-warning/10",
  IN_PROGRESS: "text-warning border-warning/30 bg-warning/10",
  COMING_SOON: "text-cyan border-cyan/30 bg-cyan/10",
  UPCOMING: "text-cyan border-cyan/30 bg-cyan/10",
  DEMO: "text-[#a9a4ff] border-royal/40 bg-royal/15",
  DRAFT: "text-text-2 border-white/15 bg-white/5",
  ARCHIVED: "text-muted border-white/10 bg-white/5",
};

export function StatusBadge({ status, kind = "product", className }: { status: string; kind?: "product" | "project"; className?: string }) {
  const label = (kind === "product" ? productStatusLabel : projectStatusLabel)[status] ?? status;
  return (
    <span className={clsx("inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium", tones[status], className)}>
      <span className="size-1.5 rounded-full bg-current" aria-hidden="true" />
      {label}
    </span>
  );
}

export function Pill({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={clsx("inline-flex items-center rounded-full border border-glass-border bg-glass px-2.5 py-0.5 text-xs font-medium text-text-2", className)}>
      {children}
    </span>
  );
}
