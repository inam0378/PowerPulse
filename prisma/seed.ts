/* Seeds DEMO content. Safe to run repeatedly:
 * - the admin user is created only if it does not exist;
 * - demo content is inserted only when the database has no products yet,
 *   so edits made in /admin are never overwritten by a redeploy. */
import { PrismaClient, ProductStatus, ProjectStatus } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const categories = [
  { name: "Business Management", slug: "business-management", icon: "briefcase", description: "Run daily operations from one place." },
  { name: "Customer Relationship Management", slug: "crm", icon: "users", description: "Win and keep customers." },
  { name: "Retail & Point of Sale", slug: "retail-pos", icon: "shopping-cart", description: "Sell faster in store and online." },
  { name: "Property & Construction", slug: "property-construction", icon: "building-2", description: "Projects, listings and rentals." },
  { name: "Healthcare Software", slug: "healthcare", icon: "pill", description: "Operations software for healthcare businesses." },
  { name: "Human Resources", slug: "human-resources", icon: "id-card", description: "People, attendance and payroll." },
  { name: "Restaurant & Hospitality", slug: "restaurant-hospitality", icon: "utensils", description: "From table to kitchen to bill." },
];

type Seed = {
  slug: string; name: string; cat: string; icon: string; accent: string; shape: string;
  tagline: string; short: string; overview: string; featured?: boolean; isNew?: boolean;
  status?: ProductStatus; features: [string, string][]; benefits: string[]; audience: string[];
};

const products: Seed[] = [
  {
    slug: "business-management", name: "PowerPulse Business Management", cat: "business-management", icon: "briefcase",
    accent: "#3478FF", shape: "icosahedron", featured: true,
    tagline: "Your whole business, one dashboard.",
    short: "A centralized platform for managing daily business operations, customers, sales, expenses, inventory, and reporting.",
    overview: "PowerPulse Business Management brings sales, expenses, stock and customers into a single workspace, so owners see the real state of the business without stitching spreadsheets together.",
    features: [["Sales & invoicing", "Create quotes and invoices, track payments and outstanding balances."], ["Expense tracking", "Categorise spending and attach receipts."], ["Inventory", "Stock levels, low-stock alerts and adjustments."], ["Customer records", "Contact details, history and balances in one profile."], ["Reports", "Profit & loss, sales trends and exportable summaries."], ["Multi-user access", "Give staff the permissions they need, nothing more."]],
    benefits: ["Replace scattered spreadsheets", "See profit in real time", "Spend less time on admin"],
    audience: ["Small and medium businesses", "Wholesalers and distributors", "Service companies"],
  },
  {
    slug: "crm", name: "PowerPulse CRM", cat: "crm", icon: "users", accent: "#625BFF", shape: "torusKnot", featured: true,
    tagline: "Every lead, every follow-up, never missed.",
    short: "A platform for managing leads, customer relationships, sales pipelines, communication, and follow-ups.",
    overview: "PowerPulse CRM gives sales teams a clear pipeline, automatic follow-up reminders and a full history of every customer conversation.",
    features: [["Visual pipeline", "Drag deals through custom stages."], ["Lead capture", "Collect leads from forms and imports."], ["Follow-up reminders", "Tasks and reminders so no lead goes cold."], ["Communication log", "Calls, emails and notes on one timeline."], ["Team performance", "Win rates and activity by salesperson."], ["Segments", "Group customers for targeted outreach."]],
    benefits: ["Close more deals", "Shorter response times", "Shared customer knowledge"],
    audience: ["Sales teams", "Agencies", "B2B companies"],
  },
  {
    slug: "pos", name: "PowerPulse POS", cat: "retail-pos", icon: "shopping-cart", accent: "#00D4FF", shape: "octahedron", featured: true,
    tagline: "Checkout in seconds. Stock in sync.",
    short: "A modern point-of-sale platform for sales, inventory, receipts, transactions, and business reporting.",
    overview: "PowerPulse POS is a fast, touch-friendly checkout that keeps inventory accurate across counters and branches, with clear daily reporting.",
    features: [["Fast checkout", "Barcode scanning, discounts and split payments."], ["Receipts", "Printed and digital receipts."], ["Live inventory", "Every sale updates stock instantly."], ["Shift reports", "Cash-up and end-of-day summaries."], ["Multi-branch", "Manage several stores from one account."], ["Returns", "Refunds and exchanges with an audit trail."]],
    benefits: ["Shorter queues", "Accurate stock", "Clear daily numbers"],
    audience: ["Retail stores", "Supermarkets", "Boutiques"],
  },
  {
    slug: "construction-rental", name: "PowerPulse Construction & Rental", cat: "property-construction", icon: "building-2", accent: "#4F8CFF", shape: "box", isNew: true,
    tagline: "Build, list, sell and rent from one platform.",
    short: "A software solution for property management, construction projects, house buying, selling, renting, property listings, and rental management.",
    overview: "PowerPulse Construction & Rental connects construction project tracking with property listings, sales and rental management, following a property from foundation to tenant.",
    features: [["Project tracking", "Milestones, budgets and contractor progress."], ["Property listings", "Publish units for sale or rent."], ["Buyer & tenant records", "Leads, agreements and documents."], ["Rent collection", "Schedules, reminders and arrears tracking."], ["Maintenance", "Log and assign repair requests."], ["Portfolio reports", "Occupancy, income and project costs."]],
    benefits: ["One record per property", "Fewer missed payments", "Clear project costs"],
    audience: ["Developers and builders", "Real estate agencies", "Landlords and property managers"],
  },
  {
    slug: "pharmacy", name: "PowerPulse Pharmacy Management", cat: "healthcare", icon: "pill", accent: "#22C3E6", shape: "capsule",
    status: "IN_DEVELOPMENT",
    tagline: "Medicine inventory you can trust.",
    short: "A pharmacy management solution for medicine inventory, sales, purchases, suppliers, and business operations.",
    overview: "PowerPulse Pharmacy Management tracks batches and expiry dates, manages supplier purchases and keeps counter sales fast and accurate.",
    features: [["Batch & expiry tracking", "Alerts before stock expires."], ["Purchases & suppliers", "Orders, deliveries and supplier balances."], ["Counter sales", "Quick search by brand or generic name."], ["Stock valuation", "Know the value of what is on your shelves."], ["Reorder levels", "Automatic low-stock suggestions."], ["Reports", "Sales, margins and expiry reports."]],
    benefits: ["Less expired stock", "Faster counter service", "Cleaner supplier accounts"],
    audience: ["Independent pharmacies", "Pharmacy chains", "Medical stores"],
  },
  {
    slug: "hr-payroll", name: "PowerPulse HR & Payroll", cat: "human-resources", icon: "id-card", accent: "#7B6CFF", shape: "dodecahedron", featured: true,
    tagline: "People operations without the paperwork.",
    short: "A platform for employee management, attendance, payroll, leave management, and HR reporting.",
    overview: "PowerPulse HR & Payroll keeps employee records, attendance and leave in one place and turns them into accurate payroll every month.",
    features: [["Employee records", "Profiles, documents and contracts."], ["Attendance", "Check-in tracking and timesheets."], ["Leave management", "Requests, approvals and balances."], ["Payroll", "Salaries, allowances and deductions calculated automatically."], ["Payslips", "Generate and share payslips."], ["HR reports", "Headcount, turnover and payroll summaries."]],
    benefits: ["Payroll in minutes", "Fewer leave disputes", "Organised employee files"],
    audience: ["Growing teams", "HR departments", "Multi-branch employers"],
  },
  {
    slug: "restaurant", name: "PowerPulse Restaurant Management", cat: "restaurant-hospitality", icon: "utensils", accent: "#00B8FF", shape: "torus",
    status: "COMING_SOON", isNew: true,
    tagline: "From table to kitchen to bill.",
    short: "A platform for restaurant operations, orders, tables, menus, billing, and kitchen management.",
    overview: "PowerPulse Restaurant Management connects front-of-house orders to the kitchen display and the final bill, so service stays fast even at peak hours.",
    features: [["Table management", "Floor plan with live table status."], ["Order taking", "Dine-in, takeaway and delivery orders."], ["Kitchen display", "Orders routed to the right station."], ["Menu management", "Items, modifiers and pricing."], ["Billing", "Split bills, discounts and service charges."], ["Daily reports", "Sales by item, staff and hour."]],
    benefits: ["Faster table turns", "Fewer order mistakes", "Clear daily sales"],
    audience: ["Restaurants and cafés", "Cloud kitchens", "Hotels"],
  },
];

const ecosystemPlans = [
  { name: "Starter", m: 1900, y: 19000, desc: "For new businesses getting organised.", access: "Any 1 PowerPulse product", support: "Email support", features: ["1 product of your choice", "Up to 3 users", "Core features", "Standard reports", "Data export"], limits: [["Products", "1"], ["Users", "3"], ["Storage", "5 GB"]] },
  { name: "Professional", m: 4900, y: 49000, desc: "For growing teams that need more.", access: "Any 3 PowerPulse products", support: "Priority email & chat", highlighted: true, features: ["3 products of your choice", "Up to 15 users", "All features", "Advanced reports", "Role permissions"], limits: [["Products", "3"], ["Users", "15"], ["Storage", "50 GB"]] },
  { name: "Business", m: 9900, y: 99000, desc: "For established, multi-branch operations.", access: "All published PowerPulse products", support: "Phone, chat & onboarding", features: ["All published products", "Up to 50 users", "Multi-branch", "Audit logs", "Onboarding session"], limits: [["Products", "All published"], ["Users", "50"], ["Storage", "250 GB"]] },
  { name: "Enterprise", m: null, y: null, desc: "Custom terms for large organisations.", access: "All products + custom work", support: "Dedicated account manager", custom: true, cta: "Contact sales", features: ["Everything in Business", "Unlimited users", "SSO & custom roles", "SLA", "Custom integrations"], limits: [["Products", "All + custom"], ["Users", "Unlimited"], ["Storage", "Custom"]] },
];

const productPlanTemplate = [
  { name: "Basic", m: 1500, y: 15000, features: ["Core features", "2 users", "Email support"], limits: [["Users", "2"]] },
  { name: "Plus", m: 3500, y: 35000, highlighted: true, features: ["All features", "10 users", "Priority support", "Advanced reports"], limits: [["Users", "10"]] },
  { name: "Custom", m: null, y: null, custom: true, cta: "Contact sales", features: ["Unlimited users", "Custom setup", "Dedicated support"], limits: [["Users", "Unlimited"]] },
];

const projects = [
  { slug: "retail-chain-rollout", title: "Retail chain POS rollout", status: "COMPLETED", category: "Retail", accent: "#00D4FF", summary: "Sample: POS deployment across a 12-branch retail chain.", tags: ["POS", "Multi-branch"] },
  { slug: "clinic-network-pharmacy", title: "Pharmacy inventory migration", status: "IN_PROGRESS", category: "Healthcare", accent: "#22C3E6", summary: "Sample: moving a pharmacy group from spreadsheets to batch-level tracking.", tags: ["Pharmacy", "Migration"] },
  { slug: "property-developer-portal", title: "Developer sales & rental portal", status: "IN_PROGRESS", category: "Property", accent: "#4F8CFF", summary: "Sample: listings and rent collection for a residential developer.", tags: ["Property", "Rentals"] },
  { slug: "restaurant-kitchen-display", title: "Kitchen display system", status: "UPCOMING", category: "Hospitality", accent: "#00B8FF", summary: "Sample: real-time kitchen routing for a restaurant group.", tags: ["Restaurant", "Real-time"] },
  { slug: "sales-team-crm", title: "Sales team CRM onboarding", status: "COMPLETED", category: "Sales", accent: "#625BFF", summary: "Sample: pipeline setup and data import for a 40-person sales team.", tags: ["CRM", "Onboarding"] },
  { slug: "payroll-automation-demo", title: "Payroll automation demo", status: "DEMO", category: "HR", accent: "#7B6CFF", summary: "Sample: end-to-end monthly payroll run for a demo company.", tags: ["Payroll", "Demo"] },
];

const testimonials = [
  { name: "Sample Customer", role: "Operations Manager", company: "Demo Retail Co.", quote: "Placeholder testimonial: replace with a real customer quote from the admin dashboard." },
  { name: "Sample Customer", role: "Founder", company: "Demo Services Ltd.", quote: "Placeholder testimonial: replace with a real customer quote from the admin dashboard." },
  { name: "Sample Customer", role: "HR Lead", company: "Demo Manufacturing", quote: "Placeholder testimonial: replace with a real customer quote from the admin dashboard." },
];

const generalFaqs = [
  ["Do I have to subscribe to every product?", "No. Every PowerPulse product is independent. You can subscribe to a single product, or choose an ecosystem plan that covers several."],
  ["What is the difference between ecosystem plans and product plans?", "Ecosystem plans give access to a number of PowerPulse products under one subscription. Product plans are priced for one specific product only and do not include access to other products."],
  ["Can I switch between monthly and yearly billing?", "Yes. Yearly billing is discounted compared with paying monthly. Online checkout is being set up, so for now our team activates subscriptions for you."],
  ["Is my data secure?", "Every product uses encrypted connections, role-based access and regular backups. You can export your data at any time."],
  ["Can I request a demo?", "Yes. Every product page has a demo request form and our team will get back to you."],
];

async function main() {
  const adminEmail = (process.env.ADMIN_EMAIL || "admin@powerpulse.local").toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD;
  const existingAdmin = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (!existingAdmin) {
    if (!adminPassword) {
      console.warn("[seed] ADMIN_PASSWORD not set, skipping admin user creation.");
    } else {
      await prisma.user.create({ data: { email: adminEmail, name: "Administrator", role: "ADMIN", passwordHash: await bcrypt.hash(adminPassword, 12) } });
      console.log(`[seed] Created admin user ${adminEmail}`);
    }
  }

  if ((await prisma.product.count()) > 0) {
    console.log("[seed] Products already exist, demo content not re-seeded.");
    return;
  }

  const catIds: Record<string, string> = {};
  for (const [i, c] of categories.entries()) {
    const row = await prisma.category.create({ data: { ...c, sortOrder: i } });
    catIds[c.slug] = row.id;
  }

  for (const [i, p] of products.entries()) {
    const product = await prisma.product.create({
      data: {
        slug: p.slug, name: p.name, tagline: p.tagline, shortDescription: p.short, overview: p.overview,
        icon: p.icon, accentColor: p.accent, visualShape: p.shape, status: p.status ?? "PUBLISHED",
        featured: !!p.featured, isNew: !!p.isNew, sortOrder: i, categoryId: catIds[p.cat],
        features: p.features.map(([title, description]) => ({ title, description })),
        benefits: p.benefits, audience: p.audience, screenshots: [],
      },
    });
    for (const [j, pl] of productPlanTemplate.entries()) {
      await prisma.plan.create({
        data: {
          name: pl.name, scope: "PRODUCT", productId: product.id, description: `${pl.name} plan for ${p.name}.`,
          monthlyCents: pl.m, yearlyCents: pl.y, isCustom: !!pl.custom, highlighted: !!pl.highlighted,
          features: pl.features, limits: pl.limits.map(([label, value]) => ({ label, value })),
          productAccess: `${p.name} only`, supportLevel: pl.custom ? "Dedicated" : "Standard",
          ctaLabel: pl.cta ?? "Get started", sortOrder: j,
        },
      });
    }
    await prisma.faq.createMany({
      data: [
        { productId: product.id, question: `Who is ${p.name} for?`, answer: `${p.audience.join(", ")}.`, sortOrder: 0 },
        { productId: product.id, question: "Does this plan include other PowerPulse products?", answer: "No. Product plans cover this product only. Choose an ecosystem plan if you need several products.", sortOrder: 1 },
        { productId: product.id, question: "Can I try it first?", answer: "Yes. Request a demo below and our team will walk you through it.", sortOrder: 2 },
      ],
    });
  }

  for (const [i, pl] of ecosystemPlans.entries()) {
    await prisma.plan.create({
      data: {
        name: pl.name, scope: "ECOSYSTEM", description: pl.desc, monthlyCents: pl.m, yearlyCents: pl.y,
        isCustom: !!pl.custom, highlighted: !!pl.highlighted, features: pl.features,
        limits: pl.limits.map(([label, value]) => ({ label, value })), productAccess: pl.access,
        supportLevel: pl.support, ctaLabel: pl.cta ?? "Get started", sortOrder: i,
      },
    });
  }

  for (const [i, pr] of projects.entries()) {
    await prisma.project.create({
      data: {
        slug: pr.slug, title: pr.title, summary: pr.summary, category: pr.category, status: pr.status as ProjectStatus,
        accentColor: pr.accent, tags: pr.tags, sortOrder: i,
        description: `${pr.summary} This is placeholder portfolio content. Replace it with a real case study from Admin › Projects.`,
      },
    });
  }

  await prisma.testimonial.createMany({ data: testimonials.map((t, i) => ({ ...t, isSample: true, sortOrder: i })) });
  await prisma.faq.createMany({ data: generalFaqs.map(([question, answer], i) => ({ question, answer, sortOrder: i })) });
  console.log("[seed] Demo content inserted.");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
