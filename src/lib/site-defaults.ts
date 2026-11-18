// Default site content. Each key is stored in the Setting table and can be
// edited from /admin/settings. These values are only used as a fallback when
// a key has never been saved.

export type Stat = { label: string; value: number; suffix: string; prefix?: string };
export type SocialLink = { label: string; url: string };

export const siteDefaults = {
  brand: {
    name: "PowerPulse",
    tagline: "One Ecosystem. Unlimited Possibilities.",
    supportingTagline: "Powering Businesses Through Intelligent Software.",
  },
  hero: {
    eyebrow: "The PowerPulse software ecosystem",
    title: "One Ecosystem. Unlimited Possibilities.",
    subtitle:
      "Independent, purpose-built SaaS products for every part of your business, designed, owned and run by one team, under one standard of quality.",
    primaryCta: "Explore software",
    secondaryCta: "View pricing",
  },
  intro: {
    title: "A software company that builds products, not projects",
    body:
      "PowerPulse designs, owns and operates a growing family of business applications. Each product is independent, so you subscribe only to what you need, yet every one shares the same infrastructure, security standards and support team.",
  },
  stats: [
    { label: "Software products", value: 7, suffix: "+" },
    { label: "Industries served", value: 6, suffix: "" },
    { label: "Target uptime", value: 99.9, suffix: "%" },
    { label: "Support coverage", value: 24, suffix: "/7" },
  ] as Stat[],
  statsNote: "Sample figures, edit them in Admin › Settings.",
  why: [
    { title: "Independent products", body: "Subscribe to one product or many. No forced bundles, no hidden dependencies.", icon: "boxes" },
    { title: "One quality standard", body: "Every product ships on the same design system, security model and release process.", icon: "shield-check" },
    { title: "Built to scale", body: "Start as a single location and grow into multi-branch operations without migrating.", icon: "trending-up" },
    { title: "Human support", body: "Talk to the people who build the software, not a script.", icon: "headset" },
  ],
  cta: {
    title: "Ready to power up your business?",
    body: "Pick the products you need today and add more as you grow.",
    primary: "Get started",
    secondary: "Talk to sales",
  },
  about: {
    vision: "A world where every business, of any size, runs on software that is as reliable as electricity.",
    mission: "Build focused, dependable business applications and keep improving them for as long as our customers rely on them.",
    philosophy:
      "We ship small, useful improvements continuously instead of big, risky rewrites. Every product is measured by one question: does it save our customers time this week?",
    values: [
      { title: "Reliability first", body: "Software our customers can forget about because it simply works." },
      { title: "Clarity over complexity", body: "Fewer features, done properly, with interfaces anyone can learn." },
      { title: "Long-term ownership", body: "We run what we build. No abandoned products." },
      { title: "Respect for data", body: "Your business data belongs to you, always exportable, always protected." },
    ],
    roadmap: [
      { period: "Now", title: "Core product family", body: "Business, CRM, POS, HR & Payroll and industry products." },
      { period: "Next", title: "Unified account", body: "One login and billing profile across every PowerPulse product." },
      { period: "Later", title: "Shared data layer", body: "Optional connections so products can share customers, inventory and reports." },
      { period: "Future", title: "Open marketplace", body: "Integrations and extensions built by partners." },
    ],
  },
  contact: {
    email: "hello@powerpulse.example",
    salesEmail: "sales@powerpulse.example",
    supportEmail: "support@powerpulse.example",
    phone: "",
    address: "",
  },
  socials: [
    { label: "LinkedIn", url: "https://www.linkedin.com/" },
    { label: "X", url: "https://x.com/" },
    { label: "GitHub", url: "https://github.com/" },
    { label: "YouTube", url: "https://www.youtube.com/" },
  ] as SocialLink[],
};

export type SiteContent = typeof siteDefaults;
export type SiteKey = keyof SiteContent;
