import { ArrowRight } from "lucide-react";
import { ButtonLink } from "../ui/Button";
import { Magnetic } from "../ui/Magnetic";

export function CtaBand({ title, body, primary, secondary }: { title: string; body: string; primary: string; secondary: string }) {
  return (
    <section className="container-pp py-20">
      <div data-reveal className="noise relative overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-[#0d1b46] via-surface to-[#160f3d] px-6 py-16 text-center sm:px-12">
        <div aria-hidden="true" className="absolute -top-24 left-1/2 size-[28rem] -translate-x-1/2 rounded-full bg-blue/30 blur-[120px]" />
        <div aria-hidden="true" className="grid-lines absolute inset-0" />
        <div className="relative">
          <h2 className="mx-auto max-w-2xl font-display text-3xl font-semibold sm:text-5xl">{title}</h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-text-2">{body}</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Magnetic><ButtonLink href="/pricing" size="lg">{primary}<ArrowRight className="size-4 transition-transform group-hover:translate-x-1" /></ButtonLink></Magnetic>
            <ButtonLink href="/contact?type=SALES" variant="secondary" size="lg">{secondary}</ButtonLink>
          </div>
        </div>
      </div>
    </section>
  );
}
