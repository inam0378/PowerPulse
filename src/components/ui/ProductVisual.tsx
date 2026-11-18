import clsx from "clsx";
import { Icon } from "./Icon";

/**
 * Generated "app preview" used whenever a product has no uploaded screenshot.
 * Purely decorative, tinted with the product accent colour.
 */
export function ProductVisual({ accent, icon, name, className, variant = 0 }: { accent: string; icon: string; name: string; className?: string; variant?: number }) {
  const bars = [42, 68, 54, 82, 61, 90, 74].map((h, i) => ((h + variant * 13 + i * 7) % 60) + 30);
  return (
    <div role="img" aria-label={`${name} interface preview`} className={clsx("relative overflow-hidden rounded-xl border border-white/10 bg-[#0a1124]", className)}>
      <div className="flex items-center gap-1.5 border-b border-white/5 px-3 py-2">
        <span className="size-2 rounded-full bg-white/15" /><span className="size-2 rounded-full bg-white/15" /><span className="size-2 rounded-full bg-white/15" />
        <span className="ml-2 h-2 w-24 rounded-full bg-white/5" />
      </div>
      <div className="flex">
        <div className="hidden w-[22%] flex-col gap-2 border-r border-white/5 p-3 sm:flex">
          <div className="grid size-7 place-items-center rounded-lg" style={{ background: `${accent}22`, color: accent }}>
            <Icon name={icon} className="size-4" />
          </div>
          {[70, 55, 80, 45, 60].map((w, i) => (
            <span key={i} className="h-1.5 rounded-full" style={{ width: `${w}%`, background: i === 1 ? accent : "rgba(255,255,255,0.08)" }} />
          ))}
        </div>
        <div className="flex-1 space-y-3 p-3">
          <div className="grid grid-cols-3 gap-2">
            {[0, 1, 2].map((i) => (
              <div key={i} className="rounded-lg border border-white/5 bg-white/[0.03] p-2">
                <span className="block h-1.5 w-1/2 rounded-full bg-white/10" />
                <span className="mt-2 block h-2.5 w-3/4 rounded-full" style={{ background: i === 0 ? accent : "rgba(255,255,255,0.18)" }} />
              </div>
            ))}
          </div>
          <div className="flex h-20 items-end gap-1.5 rounded-lg border border-white/5 bg-white/[0.02] p-2">
            {bars.map((h, i) => (
              <span key={i} className="flex-1 rounded-sm" style={{ height: `${h}%`, background: `linear-gradient(to top, ${accent}33, ${accent})`, opacity: 0.45 + i * 0.07 }} />
            ))}
          </div>
          <div className="space-y-1.5">
            {[90, 75, 82].map((w, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="size-3 rounded-full bg-white/10" />
                <span className="h-1.5 rounded-full bg-white/[0.07]" style={{ width: `${w}%` }} />
              </div>
            ))}
          </div>
        </div>
      </div>
      <div aria-hidden="true" className="pointer-events-none absolute -top-10 -right-10 size-40 rounded-full blur-3xl" style={{ background: `${accent}40` }} />
    </div>
  );
}
