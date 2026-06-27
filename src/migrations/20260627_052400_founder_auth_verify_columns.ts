import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * Add Payload auth verify columns on founders (unconditional verify config).
 * Prior migration used `_verification_token`; Payload expects `_verificationtoken`.
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "founders" ADD COLUMN IF NOT EXISTS "_verified" boolean;
    ALTER TABLE "founders" ADD COLUMN IF NOT EXISTS "_verificationtoken" varchar;
    ALTER TABLE "founders" ADD COLUMN IF NOT EXISTS "login_attempts" numeric DEFAULT 0;
    ALTER TABLE "founders" ADD COLUMN IF NOT EXISTS "lock_until" timestamp(3) with time zone;
    UPDATE "founders"
      SET "_verificationtoken" = "_verification_token"
      WHERE "_verificationtoken" IS NULL
        AND "_verification_token" IS NOT NULL;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "founders" DROP COLUMN IF EXISTS "lock_until";
    ALTER TABLE "founders" DROP COLUMN IF EXISTS "login_attempts";
    ALTER TABLE "founders" DROP COLUMN IF EXISTS "_verificationtoken";
    ALTER TABLE "founders" DROP COLUMN IF EXISTS "_verified";
  `)
}
