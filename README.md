# Founders of Startups

A multi-organization **Startup Ecosystem Platform** built with Next.js (App Router), Payload CMS 3, PostgreSQL on Supabase, and S3-compatible media storage.

**Phase 0 + Phase 1 (this repo):** Payload admin, full schema, editorial homepage/stories/authors, SEO (sitemap, RSS, JSON-LD), and newsletter capture UI.

## Stack

- **Next.js** (App Router) + TypeScript (strict)
- **Payload CMS 3** embedded in the same app (`/admin`)
- **PostgreSQL** via `@payloadcms/db-postgres` (Supabase)
- **Media** via isolated S3 adapter (`src/lib/storage.ts`) — Supabase Storage, R2, or AWS with env vars only
- **Tailwind CSS** + shadcn-style UI (black / yellow / white)

## Project structure

```
src/
├── access/                 # Payload access control helpers
├── app/
│   ├── (payload)/          # Admin panel + REST API routes
│   ├── (site)/               # Public marketing/editorial pages
│   ├── feed.xml/             # RSS feed
│   ├── sitemap.ts
│   └── robots.ts
├── collections/              # All Payload collections + shared fields
├── components/               # UI + layout + story components
├── lib/
│   ├── data/                 # Local API query helpers
│   ├── storage.ts            # S3-compatible storage plugin (single switch point)
│   ├── payload.ts
│   ├── richtext.ts           # Lexical → sanitized HTML
│   └── seo.ts
├── migrations/               # Payload Postgres migrations (committed)
└── payload.config.ts
scripts/
└── seed.ts                   # Admin, orgs, taxonomy, sample stories
```

## Collections

| Group | Slug | Notes |
|-------|------|-------|
| Editorial | `users` | Auth — editors/admins + author profiles |
| Editorial | `stories` | Drafts/versions, SEO group, rich text |
| Editorial | `categories`, `tags`, `media` | |
| Community | `founders` | Auth — public founder accounts (schema only in Phase 0) |
| Community | `startups`, `industries`, `organizations` | Full schema + indexes; directory UI in Phase 2 |

## Setup

### 1. Clone and install

```bash
npm install
```

### 2. Environment

```bash
cp .env.example .env
```

Fill in:

- `DATABASE_URL` — Supabase Postgres **transaction pooler (`:6543`)** for runtime (local dev + Vercel)
- `DATABASE_URI_SESSION` — Supabase **direct (`:5432`)** for migrations only (required on Vercel when `DATABASE_URL` is pooled)
- `PAYLOAD_SECRET` — long random string
- `NEXT_PUBLIC_SERVER_URL` — e.g. `http://localhost:3000` (production: your Vercel URL)
- S3 vars — optional locally (media falls back to disk); required for production media on Supabase/R2

### 3. Database migrations

**Production uses migrations only** (`push: false`). Migrations require a **session-capable** connection — Supabase **direct `:5432`**, not the transaction pooler (`:6543`).

**Local:** if `DATABASE_URL` already points at `:5432`, `npm run migrate` works without `DATABASE_URI_SESSION`. For pooler parity locally, set both URLs like production.

**Deploy:** Vercel runs `npm run ci` (`migrate` then `build`). `npm run migrate` uses `DATABASE_URI_SESSION`; runtime keeps `DATABASE_URL` on `:6543`.

```bash
npm run migrate
```

Create a new migration after schema changes:

```bash
npm run payload migrate:create
```

### 4. Seed sample content

```bash
npm run seed
```

Creates:

- 1 admin user (`SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD`)
- Organizations: **NSRCEL**, **IIM Bangalore** (with parent link)
- Categories, tags, and 3 published stories

### 5. Develop

```bash
npm run dev
```

- Public site: [http://localhost:3000](http://localhost:3000)
- Payload admin: [http://localhost:3000/admin](http://localhost:3000/admin)

### 6. Production (Vercel)

`vercel.json` sets **`npm run ci`** — migrations on the session connection, then `next build`. Runtime queries use `DATABASE_URL` (`:6543` pooler).

**Vercel env vars:**

| Variable | Value |
|----------|--------|
| `DATABASE_URL` | Transaction pooler, port **6543** |
| `DATABASE_URI_SESSION` | Direct / session pooler, port **5432** (migrations at build time) |
| `PAYLOAD_SECRET` | Same secret as local |
| `NEXT_PUBLIC_SERVER_URL` | Your production URL |
| S3 vars | Supabase Storage (or R2) credentials |

If the Vercel dashboard has **Build Command** overridden, set it to `npm run ci` or turn the override off so `vercel.json` applies.

## Public visibility rules

Two independent trust layers:

| Layer | Gates | Effect |
|-------|-------|--------|
| **Moderation** | `moderationStatus: approved` | Public visibility (lists, profile pages, Local API reads) |
| **Verification** | `verificationStatus: verified` | Search indexing + `✓ Verified` badge only |

- **Stories:** only `_status: published` (unchanged); `seo.noindex` respected in metadata and sitemap
- **Founders / Startups:** publicly visible when **approved** (unverified approved profiles are visible but `noindex`)
- **Sitemap:** community profiles included only when **approved + verified**
- Draft / pending / rejected moderation: excluded from public queries and return 404 on profile routes

## Scripts

| Command | Purpose |
|---------|---------|
| `npm run dev` | Next.js dev server |
| `npm run build` | Production build (no migrate) |
| `npm run migrate` | Apply pending Payload migrations (`DATABASE_URI_SESSION` or direct `DATABASE_URL`) |
| `npm run ci` | Migrate + build (Vercel deploy) |
| `npm run payload` | Payload CLI |
| `npm run seed` | Seed database |
| `npm run generate:types` | Regenerate `payload-types.ts` |
| `npm run generate:importmap` | Regenerate admin import map |

## Roadmap (not in this pass)

- **Phase 2:** Directory pages, filters, founder/startup profiles
- **Phase 3:** Founder signup, `/account`, startup claim flow
- **Phase 4:** Connect flags, opportunities UI, trust badges

## License

Private — Founders of Startups.
