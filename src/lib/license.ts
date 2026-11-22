import "server-only";
import crypto from "node:crypto";

// Public half of the RestoPulse license key pair. The PC and tablet apps check keys against it.
export const LICENSE_PUBLIC_KEY = "MCowBQYDK2VwAyEAVho+IQcgjVHFSStEJGUa55LXYi8TYaTDCkaEZiCqc1Q=";
export const LICENSE_ENV = "RESTOPULSE_LICENSE_PRIVATE_KEY";

export type LicenseKind = "PC" | "TABLET";
export const kindOf = (code: string): LicenseKind | null => (/^RP-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{4}$/.test(code) ? "PC" : /^RT-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{4}$/.test(code) ? "TABLET" : null);

/** The private key lives only in a Vercel environment variable, never in the code or the database. */
function privateKey(): crypto.KeyObject | null {
  let raw = (process.env[LICENSE_ENV] || "").trim();
  if (!raw) return null;
  raw = raw.replace(/\\n/g, "\n").replace(/^"|"$/g, "");
  if (!raw.includes("BEGIN")) raw = `-----BEGIN PRIVATE KEY-----\n${raw.replace(/\s+/g, "")}\n-----END PRIVATE KEY-----\n`;
  try { return crypto.createPrivateKey(raw); } catch { return null; }
}

export function signerStatus(): "ok" | "missing" | "invalid" | "mismatch" {
  if (!(process.env[LICENSE_ENV] || "").trim()) return "missing";
  const k = privateKey();
  if (!k) return "invalid";
  const pub = crypto.createPublicKey(k).export({ type: "spki", format: "der" }).toString("base64");
  return pub === LICENSE_PUBLIC_KEY ? "ok" : "mismatch";
}

/** Same key format as the Windows License Tool (make-license.js): base64url(payload).base64url(Ed25519 signature). */
export function makeLicenseKey(p: { mc: string; name: string; dev: number; exp: string | null }) {
  const k = privateKey();
  if (!k || signerStatus() !== "ok") throw new Error("The license signing key is not set up on the server. See the setup box on this page.");
  const payload = Buffer.from(JSON.stringify({ v: 2, mc: p.mc, name: p.name, dev: p.dev, exp: p.exp, iat: new Date().toISOString().slice(0, 10) }), "utf8");
  const sig = crypto.sign(null, payload, k);
  const key = payload.toString("base64url") + "." + sig.toString("base64url");
  if (!crypto.verify(null, payload, crypto.createPublicKey({ key: Buffer.from(LICENSE_PUBLIC_KEY, "base64"), format: "der", type: "spki" }), sig)) throw new Error("Key check failed.");
  return key;
}
