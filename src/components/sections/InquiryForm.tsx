"use client";
import { useActionState, useState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import clsx from "clsx";
import { submitInquiry, type InquiryState } from "@/app/actions/inquiry";
import { Button } from "../ui/Button";
import { keepValues } from "../admin/AdminForm";

const types = [
  { v: "SALES", l: "Sales inquiry" },
  { v: "PARTNERSHIP", l: "Partnership" },
  { v: "SUPPORT", l: "Technical support" },
  { v: "DEMO", l: "Demo request" },
  { v: "GENERAL", l: "General question" },
];

export function InquiryForm({ defaultType = "GENERAL", productSlug, productName, planName, hideType = false }: { defaultType?: string; productSlug?: string; productName?: string; planName?: string; hideType?: boolean }) {
  const [state, action, pending] = useActionState<InquiryState, FormData>(submitInquiry, { ok: false, message: "" });
  const [type, setType] = useState(types.some((t) => t.v === defaultType) ? defaultType : "GENERAL");
  const err = state.errors ?? {};

  if (state.ok) {
    return (
      <div role="status" className="glass flex flex-col items-center rounded-2xl p-10 text-center">
        <CheckCircle2 className="size-12 text-success" aria-hidden="true" />
        <p className="mt-4 font-display text-xl font-semibold">Message received</p>
        <p className="mt-2 max-w-sm text-text-2">{state.message}</p>
      </div>
    );
  }

  const field = (name: string, label: string, input: React.ReactNode, hint?: string) => (
    <div>
      <label htmlFor={`f-${name}`} className="label">{label}</label>
      {input}
      {err[name] ? <p id={`e-${name}`} className="mt-1.5 text-sm text-danger">{err[name]}</p> : hint ? <p className="mt-1.5 text-xs text-muted">{hint}</p> : null}
    </div>
  );
  const cls = (name: string) => clsx("field", err[name] && "border-danger/70");

  return (
    <form onSubmit={keepValues(action)} className="glass space-y-5 rounded-2xl p-6 sm:p-8" noValidate>
      {productSlug && <input type="hidden" name="productSlug" value={productSlug} />}
      {planName && <input type="hidden" name="planName" value={planName} />}
      <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
      {hideType ? <input type="hidden" name="type" value={type} /> : (
        field("type", "What can we help with?", (
          <select id="f-type" name="type" value={type} onChange={(e) => setType(e.target.value)} className="field">
            {types.map((t) => <option key={t.v} value={t.v}>{t.l}</option>)}
          </select>
        ))
      )}
      {(productName || planName) && (
        <p className="rounded-lg border border-cyan/20 bg-cyan/5 px-3 py-2 text-sm text-text-2">
          {productName && <>Product: <span className="text-text">{productName}</span></>}{productName && planName && " · "}{planName && <>Plan: <span className="text-text">{planName}</span></>}
        </p>
      )}
      <div className="grid gap-5 sm:grid-cols-2">
        {field("name", "Full name", <input id="f-name" name="name" autoComplete="name" required className={cls("name")} aria-invalid={!!err.name} aria-describedby={err.name ? "e-name" : undefined} />)}
        {field("email", "Work email", <input id="f-email" name="email" type="email" autoComplete="email" required className={cls("email")} aria-invalid={!!err.email} aria-describedby={err.email ? "e-email" : undefined} />)}
      </div>
      {field("company", "Company (optional)", <input id="f-company" name="company" autoComplete="organization" className="field" />)}
      {field("message", "Message", <textarea id="f-message" name="message" rows={5} required className={cls("message")} aria-invalid={!!err.message} aria-describedby={err.message ? "e-message" : undefined} placeholder={type === "DEMO" ? "Tell us about your business and what you'd like to see." : "How can we help?"} />)}
      {state.message && !state.ok && <p role="alert" className="text-sm text-danger">{state.message}</p>}
      <Button type="submit" size="lg" className="w-full sm:w-auto" disabled={pending}>
        {pending && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
        {pending ? "Sending…" : type === "DEMO" ? "Request a demo" : "Send message"}
      </Button>
    </form>
  );
}
