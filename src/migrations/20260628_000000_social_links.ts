import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/** Add social link URL fields to founders and startups. */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "founders" ADD COLUMN IF NOT EXISTS "instagram" varchar;
    ALTER TABLE "founders" ADD COLUMN IF NOT EXISTS "facebook" varchar;
    ALTER TABLE "founders" ADD COLUMN IF NOT EXISTS "youtube" varchar;
    ALTER TABLE "founders" ADD COLUMN IF NOT EXISTS "github" varchar;

    ALTER TABLE "startups" ADD COLUMN IF NOT EXISTS "linked_in" varchar;
    ALTER TABLE "startups" ADD COLUMN IF NOT EXISTS "twitter" varchar;
    ALTER TABLE "startups" ADD COLUMN IF NOT EXISTS "instagram" varchar;
    ALTER TABLE "startups" ADD COLUMN IF NOT EXISTS "facebook" varchar;
    ALTER TABLE "startups" ADD COLUMN IF NOT EXISTS "youtube" varchar;
    ALTER TABLE "startups" ADD COLUMN IF NOT EXISTS "github" varchar;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "startups" DROP COLUMN IF EXISTS "github";
    ALTER TABLE "startups" DROP COLUMN IF EXISTS "youtube";
    ALTER TABLE "startups" DROP COLUMN IF EXISTS "facebook";
    ALTER TABLE "startups" DROP COLUMN IF EXISTS "instagram";
    ALTER TABLE "startups" DROP COLUMN IF EXISTS "twitter";
    ALTER TABLE "startups" DROP COLUMN IF EXISTS "linked_in";

    ALTER TABLE "founders" DROP COLUMN IF EXISTS "github";
    ALTER TABLE "founders" DROP COLUMN IF EXISTS "youtube";
    ALTER TABLE "founders" DROP COLUMN IF EXISTS "facebook";
    ALTER TABLE "founders" DROP COLUMN IF EXISTS "instagram";
  `)
}
