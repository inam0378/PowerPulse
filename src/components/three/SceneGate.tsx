"use client";
import dynamic from "next/dynamic";
import { useEffect, useRef, useState, type ReactNode } from "react";
import type { Satellite } from "./HeroScene";

const HeroScene = dynamic(() => import("./HeroScene"), { ssr: false });
const ProductScene = dynamic(() => import("./ProductScene"), { ssr: false });

type Mode = "pending" | "full" | "lite" | "static";

function hasWebGL() {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}

/** Decides between full 3D, a lighter mobile scene and a static fallback. */
function useSceneMode(): Mode {
  const [mode, setMode] = useState<Mode>("pending");
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const saveData = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData;
    if (reduce || saveData || !hasWebGL()) return setMode("static");
    const small = window.matchMedia("(max-width: 768px)").matches;
    const lowCpu = (navigator.hardwareConcurrency ?? 8) <= 4;
    setMode(small || lowCpu ? "lite" : "full");
  }, []);
  return mode;
}

/** Pauses the render loop while the canvas is scrolled out of view. */
function useInView<T extends Element>() {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(true);
  useEffect(() => {
    if (!ref.current) return;
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { rootMargin: "100px" });
    io.observe(ref.current);
    return () => io.disconnect();
  }, []);
  return { ref, inView };
}

export function StaticOrb({ color = "#3478FF" }: { color?: string }) {
  return (
    <div className="absolute inset-0 grid place-items-center" aria-hidden="true">
      <div className="relative size-64 sm:size-80">
        <div className="absolute inset-0 rounded-full blur-3xl" style={{ background: `radial-gradient(circle, ${color}66, transparent 65%)` }} />
        <div className="absolute inset-[18%] rounded-full" style={{ background: `radial-gradient(circle at 35% 30%, #9ad8ff, ${color} 45%, #0b1440 80%)`, boxShadow: `0 0 80px ${color}88, inset -20px -30px 60px #050816` }} />
        <div className="absolute inset-[6%] rounded-full border border-cyan/30" />
        <div className="absolute -inset-[8%] rounded-full border border-blue/20 [transform:rotateX(70deg)]" />
      </div>
    </div>
  );
}

function Frame({ children, mode, fallback }: { children: ReactNode; mode: Mode; fallback: ReactNode }) {
  return (
    <>
      {(mode === "static" || mode === "pending") && fallback}
      {(mode === "full" || mode === "lite") && <div className="absolute inset-0 animate-[fadeIn_1.2s_ease-out]">{children}</div>}
    </>
  );
}

export function HeroCanvas({ satellites }: { satellites: Satellite[] }) {
  const mode = useSceneMode();
  const { ref, inView } = useInView<HTMLDivElement>();
  return (
    <div ref={ref} className="absolute inset-0">
      <Frame mode={mode} fallback={<StaticOrb />}>
        <HeroScene satellites={satellites} lite={mode === "lite"} active={inView} />
      </Frame>
    </div>
  );
}

export function ProductCanvas({ shape, color }: { shape: string; color: string }) {
  const mode = useSceneMode();
  const { ref, inView } = useInView<HTMLDivElement>();
  return (
    <div ref={ref} className="absolute inset-0">
      <Frame mode={mode} fallback={<StaticOrb color={color} />}>
        <ProductScene shape={shape} color={color} active={inView} />
      </Frame>
    </div>
  );
}
