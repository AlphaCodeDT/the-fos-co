import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/** Location stateCode + cohort fields on founders and startups. */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "founders" ADD COLUMN IF NOT EXISTS "state_code" varchar;
    ALTER TABLE "founders" ADD COLUMN IF NOT EXISTS "cohort_name" varchar;
    ALTER TABLE "founders" ADD COLUMN IF NOT EXISTS "cohort_year" numeric;
    ALTER TABLE "founders" ALTER COLUMN "country" SET DEFAULT 'India';

    ALTER TABLE "startups" ADD COLUMN IF NOT EXISTS "state_code" varchar;
    ALTER TABLE "startups" ADD COLUMN IF NOT EXISTS "cohort_name" varchar;
    ALTER TABLE "startups" ADD COLUMN IF NOT EXISTS "cohort_year" numeric;
    ALTER TABLE "startups" ALTER COLUMN "country" SET DEFAULT 'India';
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "startups" ALTER COLUMN "country" DROP DEFAULT;
    ALTER TABLE "startups" DROP COLUMN IF EXISTS "cohort_year";
    ALTER TABLE "startups" DROP COLUMN IF EXISTS "cohort_name";
    ALTER TABLE "startups" DROP COLUMN IF EXISTS "state_code";

    ALTER TABLE "founders" ALTER COLUMN "country" DROP DEFAULT;
    ALTER TABLE "founders" DROP COLUMN IF EXISTS "cohort_year";
    ALTER TABLE "founders" DROP COLUMN IF EXISTS "cohort_name";
    ALTER TABLE "founders" DROP COLUMN IF EXISTS "state_code";
  `)
}
