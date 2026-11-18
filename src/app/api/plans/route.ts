import { NextResponse } from "next/server";
import { getEcosystemPlans, getProductPlansOverview } from "@/lib/data";

export async function GET() {
  const [ecosystem, products] = await Promise.all([getEcosystemPlans(), getProductPlansOverview()]);
  return NextResponse.json({ ecosystem, products }, { headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" } });
}
