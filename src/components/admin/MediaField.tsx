"use client";
import { useRef, useState } from "react";
import { Loader2, Upload } from "lucide-react";

/** URL input with an upload button. multiple=true manages a newline-separated list. */
export function MediaField({ label, name, defaultValue, multiple = false, accept = "image/*", hint }: { label: string; name: string; defaultValue?: string | null; multiple?: boolean; accept?: string; hint?: string }) {
  const [value, setValue] = useState(defaultValue ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const input = useRef<HTMLInputElement>(null);

  async function upload(files: FileList | null) {
    if (!files?.length) return;
    setBusy(true); setError("");
    try {
      const urls: string[] = [];
      for (const file of Array.from(files)) {
        const body = new FormData();
        body.append("file", file);
        const res = await fetch("/api/admin/upload", { method: "POST", body });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || "Upload failed");
        urls.push(json.url);
      }
      setValue((v) => (multiple ? [v.trim(), ...urls].filter(Boolean).join("\n") : urls[0]));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setBusy(false);
      if (input.current) input.current.value = "";
    }
  }

  const preview = multiple ? value.split("\n").map((s) => s.trim()).filter(Boolean) : value ? [value] : [];
  return (
    <div className="sm:col-span-2">
      <span className="label" id={`${name}-label`}>{label}</span>
      <div className="flex gap-2">
        {multiple ? (
          <textarea name={name} aria-labelledby={`${name}-label`} rows={3} value={value} onChange={(e) => setValue(e.target.value)} className="field font-mono text-sm" placeholder="One URL per line" />
        ) : (
          <input name={name} aria-labelledby={`${name}-label`} value={value} onChange={(e) => setValue(e.target.value)} className="field" placeholder="https://… or upload" />
        )}
        <button type="button" onClick={() => input.current?.click()} disabled={busy} className="glass inline-flex min-h-11 shrink-0 items-center gap-2 self-start rounded-xl px-4 text-sm font-medium hover:border-white/25 disabled:opacity-60">
          {busy ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : <Upload className="size-4" aria-hidden="true" />}Upload
        </button>
        <input ref={input} type="file" accept={accept} multiple={multiple} hidden onChange={(e) => upload(e.target.files)} />
      </div>
      {error && <p role="alert" className="mt-1.5 text-sm text-danger">{error}</p>}
      {hint && !error && <p className="mt-1.5 text-xs text-muted">{hint}</p>}
      {preview.length > 0 && accept.startsWith("image") && (
        <div className="mt-3 flex flex-wrap gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {preview.map((src) => <img key={src} src={src} alt="" className="h-16 rounded-lg border border-white/10 object-cover" />)}
        </div>
      )}
    </div>
  );
}
