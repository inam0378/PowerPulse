import type { ReactNode } from "react";
import clsx from "clsx";

export function Field({ label, hint, children, className }: { label: string; hint?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <div className={className}>
      <label className="block">
        <span className="label">{label}</span>
        {children}
      </label>
      {hint && <p className="mt-1.5 text-xs text-muted">{hint}</p>}
    </div>
  );
}

export function Text({ label, name, defaultValue, hint, required, type = "text", className, placeholder }: { label: string; name: string; defaultValue?: string | number | null; hint?: ReactNode; required?: boolean; type?: string; className?: string; placeholder?: string }) {
  return (
    <Field label={label} hint={hint} className={className}>
      <input name={name} type={type} defaultValue={defaultValue ?? ""} required={required} placeholder={placeholder} className="field" step={type === "number" ? "any" : undefined} />
    </Field>
  );
}

export function Area({ label, name, defaultValue, hint, rows = 4, className, mono }: { label: string; name: string; defaultValue?: string | null; hint?: ReactNode; rows?: number; className?: string; mono?: boolean }) {
  return (
    <Field label={label} hint={hint} className={className}>
      <textarea name={name} rows={rows} defaultValue={defaultValue ?? ""} className={clsx("field", mono && "font-mono text-sm")} />
    </Field>
  );
}

export function Select({ label, name, defaultValue, options, hint, className }: { label: string; name: string; defaultValue?: string | null; options: { value: string; label: string }[]; hint?: ReactNode; className?: string }) {
  return (
    <Field label={label} hint={hint} className={className}>
      <select name={name} defaultValue={defaultValue ?? ""} className="field">
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </Field>
  );
}

export function Check({ label, name, defaultChecked, hint }: { label: string; name: string; defaultChecked?: boolean; hint?: string }) {
  return (
    <label className="flex min-h-11 cursor-pointer items-start gap-3 rounded-xl border border-white/10 bg-white/[0.02] p-3">
      <input type="checkbox" name={name} defaultChecked={defaultChecked} className="mt-0.5 size-5 accent-[#00D4FF]" />
      <span><span className="block text-sm font-medium">{label}</span>{hint && <span className="block text-xs text-muted">{hint}</span>}</span>
    </label>
  );
}

export function Section({ title, children, description }: { title: string; description?: string; children: ReactNode }) {
  return (
    <fieldset className="glass rounded-2xl p-5 sm:p-6">
      <legend className="sr-only">{title}</legend>
      <h2 className="font-display text-lg font-semibold">{title}</h2>
      {description && <p className="mt-1 text-sm text-text-2">{description}</p>}
      <div className="mt-5 grid gap-5 sm:grid-cols-2">{children}</div>
    </fieldset>
  );
}
