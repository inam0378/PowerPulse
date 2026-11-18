"use client";
import { motion, useReducedMotion } from "framer-motion";

/** Word-by-word entrance for the hero headline; last sentence gets the gradient. */
export function HeroTitle({ text }: { text: string }) {
  const reduce = useReducedMotion();
  const sentences = text.split(/(?<=\.)\s+/);
  let k = 0;
  return (
    <h1 className="mt-6 font-display text-[2.6rem] leading-[1.02] font-semibold tracking-tight sm:text-6xl xl:text-7xl">
      {sentences.map((s, si) => (
        <span key={si} className="block">
          {s.split(" ").map((w) => {
            const grad = si === sentences.length - 1 && sentences.length > 1;
            const i = k++;
            return (
              <motion.span
                key={i}
                className={grad ? "text-gradient inline-block pr-[0.25em] pb-[0.08em]" : "inline-block pr-[0.25em]"}
                initial={reduce ? false : { opacity: 0, y: "0.5em", rotateX: -40 }}
                animate={{ opacity: 1, y: 0, rotateX: 0 }}
                transition={{ delay: 0.15 + i * 0.07, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              >
                {w}
              </motion.span>
            );
          })}
        </span>
      ))}
    </h1>
  );
}
