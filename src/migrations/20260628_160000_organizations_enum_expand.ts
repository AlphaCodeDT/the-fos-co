import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

const NEW_ORG_TYPES = [
  'investor',
  'venture-capital',
  'angel-network',
  'startup-community',
  'coworking-space',
  'innovation-hub',
  'corporate-innovation',
  'other',
] as const

async function addEnumValueIfMissing(db: MigrateUpArgs['db'], value: string) {
  await db.execute(sql.raw(`
    DO $$ BEGIN
      ALTER TYPE "public"."enum_organizations_type" ADD VALUE '${value}';
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;
  `))
}

/** Step 1: expand organizations type enum (must commit before values are usable). */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  for (const value of NEW_ORG_TYPES) {
    await addEnumValueIfMissing(db, value)
  }
}

export async function down(): Promise<void> {
  // PostgreSQL cannot remove enum values safely; no-op.
}
