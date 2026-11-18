# PowerPulse

**One Ecosystem. Unlimited Possibilities.**

The website and admin dashboard for PowerPulse, a multi-product SaaS company. Every product, plan, project, testimonial, FAQ and piece of site copy is stored in the database and managed from `/admin`, so new products can be added without changing any code.

> The seven products, prices, projects, statistics and testimonials included are **demo content**. Replace them from the admin dashboard before launch.

## Stack

- Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS 4
- Three.js, React Three Fiber and Drei for the 3D scenes; GSAP ScrollTrigger and Framer Motion for animation
- PostgreSQL with Prisma
- Session auth: signed JWT in an httpOnly cookie, bcrypt passwords, `ADMIN` and `CUSTOMER` roles
- Optional Vercel Blob for image and video uploads

## Run it locally

```bash
cp .env.example .env        # fill in DATABASE_URL, DIRECT_URL, AUTH_SECRET, ADMIN_EMAIL, ADMIN_PASSWORD
npm install
npx prisma migrate dev      # create the tables
npm run db:seed             # admin user + demo content
npm run dev
```

Open http://localhost:3000. Sign in at `/login` with `ADMIN_EMAIL` / `ADMIN_PASSWORD` to reach `/admin`.

## Deploy to Vercel

1. Import this repository in Vercel.
2. **Storage → Create → Postgres (Neon).** This sets `DATABASE_URL`. Add `DIRECT_URL` with the non-pooled connection string (Neon shows it as `DATABASE_URL_UNPOOLED`).
3. Add environment variables: `AUTH_SECRET` (run `openssl rand -hex 32`), `ADMIN_EMAIL`, `ADMIN_PASSWORD` and `NEXT_PUBLIC_SITE_URL`.
4. Optional: **Storage → Blob** to enable uploads from the admin dashboard. This sets `BLOB_READ_WRITE_TOKEN`. Without it, paste image URLs instead.
5. Deploy. The build runs migrations and seeds the demo content on the first deploy only. Later deploys never overwrite edits made in the admin.

**Change the admin password after the first login:** create a new admin under Admin › Users, then delete the seeded one.

## What the admin can manage

| Area | What you can do |
| --- | --- |
| Products | Add, edit or delete products; set status (Published, Draft, In development, Coming soon, Archived), featured flag, category, icon, accent colour, 3D shape, logo, screenshots, video, features, benefits and audience |
| Categories | Add, rename, reorder and delete |
| Pricing plans | Ecosystem plans and per-product plans, with monthly and yearly prices (savings calculated automatically), custom pricing, features, usage limits, product access and support level |
| Projects | Add, edit, publish/unpublish and delete portfolio entries |
| Testimonials | Add or edit quotes; anything marked "Sample" is labelled as such on the site |
| FAQs | General FAQs or FAQs attached to a product |
| Inquiries | Contact, demo and plan requests from the site; mark them handled |
| Site content | Hero, taglines, statistics, "Why PowerPulse", About page, contact details, social links |
| Users | Create admins, promote or demote users, delete accounts |

Draft and Archived products are hidden from the public site and return 404.

## Payments: not built yet

Online payment is **not integrated**. When a visitor chooses a plan, the site creates their account and records a subscription request, which appears under Admin › Inquiries. The site tells the visitor that no payment was taken. Before adding real payments, choose a gateway (for example Stripe Billing). Plans already store monthly and yearly prices in cents, so they can be mapped to gateway prices.

## Project structure

```
prisma/schema.prisma        data model
prisma/seed.ts              admin user + demo content (only runs on an empty database)
src/app/(site)/             public pages
src/app/admin/              admin dashboard and server actions (every action re-checks the admin role)
src/app/api/                public read-only API (/api/products, /api/plans) and the admin upload endpoint
src/components/three/       3D scenes with WebGL, reduced-motion and mobile fallbacks
src/lib/site-defaults.ts    default site copy (overridden by Admin › Site content)
```

## Accessibility and performance

- Colours meet WCAG AA contrast. Filled buttons use navy text, because white on the brand blue is only 3.98:1.
- `prefers-reduced-motion` turns off parallax, the 3D scenes (replaced by a static image) and scroll animations.
- On phones and low-power devices the 3D scenes load a lighter version. They are lazy-loaded and pause when scrolled out of view.
- Includes a sitemap, robots.txt, Open Graph image, per-page metadata and SoftwareApplication JSON-LD on product pages.
