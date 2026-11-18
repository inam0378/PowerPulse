import Link from "next/link";
import clsx from "clsx";
import type { ComponentProps, ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost";
type Size = "md" | "lg" | "sm";

const base =
  "group relative inline-flex items-center justify-center gap-2 rounded-full font-semibold whitespace-nowrap transition-[transform,box-shadow,background-color,border-color,color] duration-200 ease-out cursor-pointer active:scale-[0.97] disabled:opacity-50 disabled:pointer-events-none";
const sizes: Record<Size, string> = {
  sm: "min-h-10 px-4 text-sm",
  md: "min-h-11 px-6 text-[0.95rem]",
  lg: "min-h-13 px-8 text-base",
};
const variants: Record<Variant, string> = {
  // Navy on the gradient keeps label contrast ≥ 4.9:1 across the whole fill.
  primary:
    "bg-brand-gradient text-bg shadow-[0_8px_30px_-8px_rgba(0,212,255,0.55)] hover:shadow-[0_12px_40px_-6px_rgba(52,120,255,0.75)]",
  secondary: "glass text-text hover:border-white/30 hover:bg-white/10",
  ghost: "text-text-2 hover:text-text",
};

export function buttonClass(variant: Variant = "primary", size: Size = "md", className?: string) {
  return clsx(base, sizes[size], variants[variant], className);
}

export function ButtonLink({
  href, variant = "primary", size = "md", className, children, ...rest
}: { href: string; variant?: Variant; size?: Size; children: ReactNode } & Omit<ComponentProps<typeof Link>, "href">) {
  return (
    <Link href={href} className={buttonClass(variant, size, className)} {...rest}>
      {children}
    </Link>
  );
}

export function Button({
  variant = "primary", size = "md", className, ...rest
}: { variant?: Variant; size?: Size } & ComponentProps<"button">) {
  return <button className={buttonClass(variant, size, className)} {...rest} />;
}
