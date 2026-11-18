export function formatPrice(cents: number | null | undefined, currency = "USD") {
  if (cents == null) return null;
  const value = cents / 100;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: Number.isInteger(value) ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(value);
}

/** Savings of a yearly price versus paying monthly for 12 months. */
export function annualSavings(monthlyCents: number | null, yearlyCents: number | null) {
  if (monthlyCents == null || yearlyCents == null || monthlyCents <= 0) return null;
  const full = monthlyCents * 12;
  const saved = full - yearlyCents;
  if (saved <= 0) return null;
  return { cents: saved, percent: Math.round((saved / full) * 100) };
}

export function slugify(input: string) {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export const productStatusLabel: Record<string, string> = {
  PUBLISHED: "Available",
  DRAFT: "Draft",
  IN_DEVELOPMENT: "In development",
  COMING_SOON: "Coming soon",
  ARCHIVED: "Archived",
};

export const projectStatusLabel: Record<string, string> = {
  COMPLETED: "Completed",
  IN_PROGRESS: "In development",
  UPCOMING: "Upcoming",
  DEMO: "Demo",
};

export function asStringArray(v: unknown): string[] {
  return Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : [];
}

export function asFeatures(v: unknown): { title: string; description: string }[] {
  if (!Array.isArray(v)) return [];
  return v
    .filter((x) => x && typeof x === "object" && "title" in x)
    .map((x) => ({ title: String((x as { title: unknown }).title), description: String((x as { description?: unknown }).description ?? "") }));
}

export function asLimits(v: unknown): { label: string; value: string }[] {
  if (!Array.isArray(v)) return [];
  return v
    .filter((x) => x && typeof x === "object" && "label" in x)
    .map((x) => ({ label: String((x as { label: unknown }).label), value: String((x as { value?: unknown }).value ?? "") }));
}
