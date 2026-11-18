"use client";
import { useActionState } from "react";
import { Loader2 } from "lucide-react";
import clsx from "clsx";
import { login, register, type AuthState } from "@/app/actions/auth";
import { Button } from "../ui/Button";
import { keepValues } from "../admin/AdminForm";

export function LoginForm({ next }: { next?: string }) {
  const [state, action, pending] = useActionState<AuthState, FormData>(login, {});
  return (
    <form onSubmit={keepValues(action)} className="space-y-5">
      {next && <input type="hidden" name="next" value={next} />}
      <div><label htmlFor="email" className="label">Email</label><input id="email" name="email" type="email" autoComplete="email" required className="field" /></div>
      <div><label htmlFor="password" className="label">Password</label><input id="password" name="password" type="password" autoComplete="current-password" required className="field" /></div>
      {state.error && <p role="alert" className="text-sm text-danger">{state.error}</p>}
      <Button type="submit" size="lg" className="w-full" disabled={pending}>{pending && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}Sign in</Button>
    </form>
  );
}

export function RegisterForm({ plan, billing, product }: { plan?: string; billing?: string; product?: string }) {
  const [state, action, pending] = useActionState<AuthState, FormData>(register, {});
  const e = state.errors ?? {};
  const f = (name: string, label: string, props: React.InputHTMLAttributes<HTMLInputElement>, hint?: string) => (
    <div>
      <label htmlFor={name} className="label">{label}</label>
      <input id={name} name={name} className={clsx("field", e[name] && "border-danger/70")} aria-invalid={!!e[name]} aria-describedby={e[name] ? `${name}-e` : undefined} {...props} />
      {e[name] ? <p id={`${name}-e`} className="mt-1.5 text-sm text-danger">{e[name]}</p> : hint ? <p className="mt-1.5 text-xs text-muted">{hint}</p> : null}
    </div>
  );
  return (
    <form onSubmit={keepValues(action)} className="space-y-5" noValidate>
      {plan && <input type="hidden" name="plan" value={plan} />}
      {billing && <input type="hidden" name="billing" value={billing} />}
      {product && <input type="hidden" name="product" value={product} />}
      {f("name", "Full name", { autoComplete: "name", required: true })}
      {f("email", "Work email", { type: "email", autoComplete: "email", required: true })}
      {f("company", "Company (optional)", { autoComplete: "organization" })}
      {f("password", "Password", { type: "password", autoComplete: "new-password", required: true, minLength: 10 }, "At least 10 characters.")}
      {state.error && <p role="alert" className="text-sm text-danger">{state.error}</p>}
      <Button type="submit" size="lg" className="w-full" disabled={pending}>{pending && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}Create account</Button>
    </form>
  );
}
