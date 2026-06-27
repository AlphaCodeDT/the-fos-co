import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * Corrective migration: ensure founders.needs_review exists.
 * The hand-written 20260627_000713 migration intended this column but drift
 * checks showed it was missing from the live DB. Additive + idempotent only.
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "founders" ADD COLUMN IF NOT EXISTS "needs_review" boolean DEFAULT false;
    CREATE INDEX IF NOT EXISTS "founders_needs_review_idx" ON "founders" USING btree ("needs_review");
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    DROP INDEX IF EXISTS "founders_needs_review_idx";
    ALTER TABLE "founders" DROP COLUMN IF EXISTS "needs_review";
  `)
}
