"use client";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/**
 * Site-wide scroll choreography. Any element with [data-reveal] fades/rises in
 * as it enters the viewport; siblings are staggered. [data-parallax="0.2"]
 * drifts at a fraction of scroll speed. Disabled under reduced motion.
 */
export function ScrollReveal() {
  const pathname = usePathname();

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const mm = gsap.matchMedia();

    mm.add(
      { motion: "(prefers-reduced-motion: no-preference)", reduce: "(prefers-reduced-motion: reduce)" },
      (ctx) => {
        const els = gsap.utils.toArray<HTMLElement>("[data-reveal]");
        if (ctx.conditions?.reduce) {
          gsap.set(els, { opacity: 1, y: 0 });
          return;
        }
        ScrollTrigger.batch(els, {
          start: "top 88%",
          once: true,
          onEnter: (batch) =>
            gsap.to(batch, { opacity: 1, y: 0, duration: 0.9, ease: "expo.out", stagger: 0.08, overwrite: true }),
        });
        gsap.utils.toArray<HTMLElement>("[data-parallax]").forEach((el) => {
          const speed = Number(el.dataset.parallax) || 0.15;
          gsap.to(el, {
            yPercent: -100 * speed,
            ease: "none",
            scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true },
          });
        });
      },
    );
    // Content can shift after fonts/images load.
    const t = setTimeout(() => ScrollTrigger.refresh(), 400);
    return () => { clearTimeout(t); mm.revert(); };
  }, [pathname]);

  return null;
}
