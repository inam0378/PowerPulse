import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { getSession } from "@/lib/auth";

const MAX_BYTES = 25 * 1024 * 1024;
const ALLOWED: Record<string, string> = {
  "image/png": "png", "image/jpeg": "jpg", "image/webp": "webp", "image/avif": "avif", "image/gif": "gif",
  "image/svg+xml": "svg", "video/mp4": "mp4", "video/webm": "webm",
};

export async function POST(req: Request) {
  const session = await getSession();
  if (session?.role !== "ADMIN") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: "No file received" }, { status: 400 });
  const ext = ALLOWED[file.type];
  if (!ext) return NextResponse.json({ error: "Use PNG, JPG, WebP, AVIF, GIF, SVG, MP4 or WebM." }, { status: 415 });
  if (file.size > MAX_BYTES) return NextResponse.json({ error: "File is larger than 25 MB." }, { status: 413 });

  const name = `${randomUUID()}.${ext}`;

  // Production: Vercel Blob (set BLOB_READ_WRITE_TOKEN by connecting a Blob store).
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const blob = await put(`powerpulse/${name}`, file, { access: "public", contentType: file.type });
    return NextResponse.json({ url: blob.url });
  }
  // Local development fallback. Vercel's filesystem is read-only, so this only works locally.
  if (process.env.VERCEL) {
    return NextResponse.json({ error: "Uploads need a Vercel Blob store. Connect one in your Vercel project (Storage → Blob) and redeploy." }, { status: 501 });
  }
  const dir = path.join(process.cwd(), "public", "uploads");
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, name), Buffer.from(await file.arrayBuffer()));
  return NextResponse.json({ url: `/uploads/${name}` });
}
