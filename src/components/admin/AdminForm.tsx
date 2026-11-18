"use client";
import { startTransition, useActionState, type FormEvent, type ReactNode } from "react";
import { Loader2 } from "lucide-react";
import type { FormState } from "@/app/admin/actions";
import { Button } from "../ui/Button";

type Action = (state: FormState, form: FormData) => Promise<FormState>;

export function AdminForm({ action, children, submitLabel = "Save", className }: { action: Action; children: ReactNode; submitLabel?: string; className?: string }) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(action, {});
  return (
    <form onSubmit={keepValues(formAction)} className={className ?? "space-y-6"}>
      {children}
      {state.error && <p role="alert" className="rounded-xl border border-danger/40 bg-danger/10 p-3 text-sm text-danger">{state.error}</p>}
      <div className="sticky bottom-0 -mx-1 flex justify-end gap-3 border-t border-white/10 bg-bg/90 px-1 py-4 backdrop-blur">
        <Submit label={submitLabel} pending={pending} />
      </div>
    </form>
  );
}

/**
 * Submits through the action without React's automatic form reset, so a
 * validation error never wipes what the user typed.
 */
export function keepValues(formAction: (f: FormData) => void) {
  return (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    startTransition(() => formAction(data));
  };
}

function Submit({ label, pending }: { label: string; pending: boolean }) {
  return (
    <Button type="submit" disabled={pending}>
      {pending && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
      {pending ? "Saving…" : label}
    </Button>
  );
}

export function ConfirmSubmit({ children, message = "Are you sure? This cannot be undone.", className }: { children: ReactNode; message?: string; className?: string }) {
  return (
    <button type="submit" className={className} onClick={(e) => { if (!confirm(message)) e.preventDefault(); }}>
      {children}
    </button>
  );
}
