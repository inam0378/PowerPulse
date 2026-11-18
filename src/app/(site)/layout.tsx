import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { getSession } from "@/lib/auth";
import { getPublicProducts, getSettings } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const [session, settings, products] = await Promise.all([getSession(), getSettings(), getPublicProducts()]);
  return (
    <>
      <Navbar signedIn={!!session} isAdmin={session?.role === "ADMIN"} />
      <main id="main" className="relative">{children}</main>
      <Footer settings={settings} products={products} />
      <ScrollReveal />
    </>
  );
}
