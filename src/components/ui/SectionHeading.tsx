import clsx from "clsx";

export function SectionHeading({
  eyebrow, title, body, align = "center", className, as: Tag = "h2",
}: { eyebrow?: string; title: React.ReactNode; body?: React.ReactNode; align?: "center" | "left"; className?: string; as?: "h1" | "h2" }) {
  return (
    <div data-reveal className={clsx("max-w-3xl", align === "center" && "mx-auto text-center", className)}>
      {eyebrow && (
        <p className="mb-4 inline-flex items-center gap-2 text-xs font-semibold tracking-[0.2em] text-cyan uppercase">
          <span className="h-px w-6 bg-cyan/70" aria-hidden="true" />
          {eyebrow}
        </p>
      )}
      <Tag className={clsx("font-display font-semibold text-text", Tag === "h1" ? "text-4xl sm:text-5xl lg:text-6xl" : "text-3xl sm:text-4xl lg:text-[2.75rem]")}>
        {title}
      </Tag>
      {body && <p className="mt-5 text-base text-text-2 sm:text-lg">{body}</p>}
    </div>
  );
}
