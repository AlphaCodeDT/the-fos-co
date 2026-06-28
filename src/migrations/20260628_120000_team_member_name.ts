import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/** Optional display name for unlinked team members; founder_id becomes nullable. */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "startups_team" ADD COLUMN IF NOT EXISTS "name" varchar;
    ALTER TABLE "startups_team" ALTER COLUMN "founder_id" DROP NOT NULL;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    DELETE FROM "startups_team" WHERE "founder_id" IS NULL;
    ALTER TABLE "startups_team" ALTER COLUMN "founder_id" SET NOT NULL;
    ALTER TABLE "startups_team" DROP COLUMN IF EXISTS "name";
  `)
}
