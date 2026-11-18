import { NextResponse } from "next/server";
import { getProductBySlug } from "@/lib/data";

export async function GET(_: Request, { params }: { params: Promise<{ slug: string }> }) {
  const product = await getProductBySlug((await params).slug);
  if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ product }, { headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" } });
}
