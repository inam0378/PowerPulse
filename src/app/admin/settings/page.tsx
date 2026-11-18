import { prisma } from "@/lib/db";
import { getSettings } from "@/lib/data";
import { resetSetting, saveSetting } from "../actions";
import { siteDefaults, type SiteKey } from "@/lib/site-defaults";
import { PageHeader } from "@/components/admin/PageHeader";
import { AdminForm } from "@/components/admin/AdminForm";
import { Area, Text } from "@/components/admin/Fields";

export const metadata = { title: "Site content" };

const labels: Record<SiteKey, { title: string; description: string }> = {
  brand: { title: "Brand", description: "Company name and taglines used across the site." },
  hero: { title: "Home hero", description: "The first thing visitors see." },
  intro: { title: "Home introduction", description: "The ecosystem introduction section." },
  stats: { title: "Platform statistics", description: "Animated counters on the home page. Keep these truthful." },
  statsNote: { title: "Statistics footnote", description: "Small note under the statistics. Clear it once the numbers are real." },
  why: { title: "Why PowerPulse", description: "Reasons shown on the home page. icon must be one of the product icon names." },
  cta: { title: "Call to action", description: "Closing banner on several pages." },
  about: { title: "About page", description: "Vision, mission, philosophy, values and roadmap." },
  contact: { title: "Contact details", description: "Emails, phone and address." },
  socials: { title: "Social links", description: "Shown in the footer and contact page." },
};

const isLong = (s: string) => s.length > 80;

export default async function SettingsPage({ searchParams }: { searchParams: Promise<{ saved?: string }> }) {
  const [sp, settings, rows] = await Promise.all([searchParams, getSettings(), prisma.setting.findMany({ select: { key: true } })]);
  const customised = new Set(rows.map((r) => r.key));
  const keys = Object.keys(siteDefaults) as SiteKey[];
  return (
    <div className="max-w-4xl">
      <PageHeader title="Site content" description="Edit the copy and figures shown across the website. List fields use JSON. Keep the same structure as the example already in the box." notice={sp.saved ? `Saved “${labels[sp.saved as SiteKey]?.title ?? sp.saved}”. The public website is updated.` : null} />
      <nav aria-label="Sections" className="mb-8 flex flex-wrap gap-2">
        {keys.map((k) => <a key={k} href={`#s-${k}`} className="rounded-full border border-white/10 px-3 py-1.5 text-sm text-text-2 hover:text-text">{labels[k].title}</a>)}
      </nav>
      <div className="space-y-8">
        {keys.map((key) => {
          const value = settings[key] as unknown;
          return (
            <section key={key} id={`s-${key}`} className="glass scroll-mt-6 rounded-2xl p-5 sm:p-6">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <h2 className="font-display text-lg font-semibold">{labels[key].title}</h2>
                  <p className="text-sm text-text-2">{labels[key].description}</p>
                </div>
                {customised.has(key) && (
                  <form action={resetSetting}><input type="hidden" name="key" value={key} /><button type="submit" className="text-xs text-muted hover:text-text">Reset to default</button></form>
                )}
              </div>
              <div className="mt-5">
                <AdminForm action={saveSetting} submitLabel={`Save ${labels[key].title.toLowerCase()}`}>
                  <input type="hidden" name="key" value={key} />
                  {Array.isArray(value) ? (
                    <Area label="JSON" name="jsonValue" mono rows={Math.min(16, JSON.stringify(value, null, 2).split("\n").length + 1)} defaultValue={JSON.stringify(value, null, 2)} />
                  ) : typeof value === "string" ? (
                    <Area label="Text" name="jsonValue" rows={2} defaultValue={JSON.stringify(value)} hint='Wrap in double quotes, e.g. "My note". Use "" for none.' />
                  ) : (
                    <div className="grid gap-5 sm:grid-cols-2">
                      {Object.entries(value as Record<string, unknown>).map(([k, v]) =>
                        typeof v === "string" ? (
                          isLong(v) ? <Area key={k} label={k} name={k} defaultValue={v} rows={3} className="sm:col-span-2" /> : <Text key={k} label={k} name={k} defaultValue={v} />
                        ) : (
                          <Area key={k} label={`${k} (JSON)`} name={k} mono rows={10} className="sm:col-span-2" defaultValue={JSON.stringify(v, null, 2)} />
                        ),
                      )}
                    </div>
                  )}
                </AdminForm>
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
