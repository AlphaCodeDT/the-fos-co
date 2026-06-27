import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * Store public Supabase Storage URLs for founder avatars and startup logos.
 * Client-side direct uploads bypass Vercel Server Action body limits.
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "founders" ADD COLUMN IF NOT EXISTS "avatar_url" varchar;
    ALTER TABLE "startups" ADD COLUMN IF NOT EXISTS "logo_url" varchar;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "startups" DROP COLUMN IF EXISTS "logo_url";
    ALTER TABLE "founders" DROP COLUMN IF EXISTS "avatar_url";
  `)
}
