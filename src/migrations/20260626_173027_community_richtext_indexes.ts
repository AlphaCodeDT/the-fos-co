import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    UPDATE "founders" SET "bio" = NULL;
    UPDATE "startups" SET "description" = NULL;
    ALTER TABLE "founders" ALTER COLUMN "bio" SET DATA TYPE jsonb USING NULL;
    ALTER TABLE "startups" ALTER COLUMN "description" SET DATA TYPE jsonb USING NULL;
    CREATE INDEX IF NOT EXISTS "startups_is_looking_for_co_founder_idx" ON "startups" USING btree ("is_looking_for_co_founder");
    CREATE INDEX IF NOT EXISTS "isLookingForCoFounder_idx" ON "startups" USING btree ("is_looking_for_co_founder");
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    DROP INDEX IF EXISTS "startups_is_looking_for_co_founder_idx";
    DROP INDEX IF EXISTS "isLookingForCoFounder_idx";
    ALTER TABLE "founders" ALTER COLUMN "bio" SET DATA TYPE varchar USING NULL;
    ALTER TABLE "startups" ALTER COLUMN "description" SET DATA TYPE varchar USING NULL;
  `)
}
