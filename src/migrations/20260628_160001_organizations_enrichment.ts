import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/** Step 2: organizations columns, community → startup-community remap, slug backfill. */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    DO $$ BEGIN
      CREATE TYPE "public"."enum_organizations_status" AS ENUM('draft', 'published');
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;
  `)

  await db.execute(sql`
    ALTER TABLE "organizations" ADD COLUMN IF NOT EXISTS "description" varchar;
  `)

  await db.execute(sql`
    DO $$ BEGIN
      ALTER TABLE "organizations" ADD COLUMN "status" "enum_organizations_status" DEFAULT 'published' NOT NULL;
    EXCEPTION
      WHEN duplicate_column THEN null;
    END $$;
  `)

  await db.execute(sql`
    UPDATE "organizations" SET "type" = 'startup-community' WHERE "type" = 'community';
  `)

  await db.execute(sql`
    UPDATE "organizations"
    SET "slug" = lower(regexp_replace(trim("name"), '[^a-zA-Z0-9]+', '-', 'g'))
    WHERE "slug" IS NULL OR trim("slug") = '';
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    UPDATE "organizations" SET "type" = 'community' WHERE "type" = 'startup-community';

    ALTER TABLE "organizations" DROP COLUMN IF EXISTS "status";
    ALTER TABLE "organizations" DROP COLUMN IF EXISTS "description";

    DROP TYPE IF EXISTS "public"."enum_organizations_status";
  `)
}
