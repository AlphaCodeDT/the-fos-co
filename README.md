# NSRCEL Founder Directory

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

- `DATABASE_URL` — Supabase Postgres connection string (Session pooler or direct)
- `PAYLOAD_SECRET` — long random string
- `NEXT_PUBLIC_SERVER_URL` — e.g. `http://localhost:3000` (production: your Vercel URL)
- S3 vars — optional locally (media falls back to disk); required for production media on Supabase/R2

### 3. Database migrations

**Production uses migrations only** (`push: false`). Apply migrations before running or building:

```bash
npm run payload migrate
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

### 6. Production build (Vercel)

Set the build command to:

```bash
npm run ci
```

This runs `payload migrate` then `next build`.

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
| `npm run build` | Production build |
| `npm run ci` | Migrate + build (use on Vercel) |
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
