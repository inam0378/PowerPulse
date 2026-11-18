import { Plus } from "lucide-react";

export function FaqList({ faqs }: { faqs: { id: string; question: string; answer: string }[] }) {
  if (!faqs.length) return null;
  return (
    <div className="mx-auto max-w-3xl divide-y divide-white/10 rounded-[1.25rem] glass">
      {faqs.map((f) => (
        <details key={f.id} className="group px-5 sm:px-6" data-reveal>
          <summary className="flex min-h-16 cursor-pointer list-none items-center justify-between gap-4 py-4 font-medium text-text [&::-webkit-details-marker]:hidden">
            {f.question}
            <Plus className="size-5 shrink-0 text-cyan transition-transform duration-300 group-open:rotate-45" aria-hidden="true" />
          </summary>
          <p className="pb-5 text-text-2">{f.answer}</p>
        </details>
      ))}
    </div>
  );
}
