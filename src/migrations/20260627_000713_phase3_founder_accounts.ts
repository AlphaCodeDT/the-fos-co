import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "founders" ADD COLUMN IF NOT EXISTS "needs_review" boolean DEFAULT false;
    CREATE INDEX IF NOT EXISTS "founders_needs_review_idx" ON "founders" USING btree ("needs_review");

    ALTER TABLE "founders" DROP CONSTRAINT IF EXISTS "founders_owner_id_founders_id_fk";
    DROP INDEX IF EXISTS "founders_owner_idx";
    ALTER TABLE "founders" DROP COLUMN IF EXISTS "owner_id";

    ALTER TABLE "founders" ADD COLUMN IF NOT EXISTS "_verified" boolean DEFAULT false;
    ALTER TABLE "founders" ADD COLUMN IF NOT EXISTS "_verification_token" varchar;

    ALTER TABLE "startups" ADD COLUMN IF NOT EXISTS "owner_id" integer;
    ALTER TABLE "startups" DROP CONSTRAINT IF EXISTS "startups_owner_id_founders_id_fk";
    ALTER TABLE "startups" ADD CONSTRAINT "startups_owner_id_founders_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."founders"("id") ON DELETE set null ON UPDATE no action;
    CREATE INDEX IF NOT EXISTS "startups_owner_idx" ON "startups" USING btree ("owner_id");

    ALTER TABLE "startups" ADD COLUMN IF NOT EXISTS "needs_review" boolean DEFAULT false;
    CREATE INDEX IF NOT EXISTS "startups_needs_review_idx" ON "startups" USING btree ("needs_review");

    ALTER TABLE "media" ADD COLUMN IF NOT EXISTS "uploaded_by_id" integer;
    ALTER TABLE "media" DROP CONSTRAINT IF EXISTS "media_uploaded_by_id_founders_id_fk";
    ALTER TABLE "media" ADD CONSTRAINT "media_uploaded_by_id_founders_id_fk" FOREIGN KEY ("uploaded_by_id") REFERENCES "public"."founders"("id") ON DELETE set null ON UPDATE no action;
    CREATE INDEX IF NOT EXISTS "media_uploaded_by_idx" ON "media" USING btree ("uploaded_by_id");
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    DROP INDEX IF EXISTS "media_uploaded_by_idx";
    ALTER TABLE "media" DROP CONSTRAINT IF EXISTS "media_uploaded_by_id_founders_id_fk";
    ALTER TABLE "media" DROP COLUMN IF EXISTS "uploaded_by_id";

    DROP INDEX IF EXISTS "startups_needs_review_idx";
    ALTER TABLE "startups" DROP COLUMN IF EXISTS "needs_review";

    ALTER TABLE "startups" DROP CONSTRAINT IF EXISTS "startups_owner_id_founders_id_fk";
    DROP INDEX IF EXISTS "startups_owner_idx";
    ALTER TABLE "startups" DROP COLUMN IF EXISTS "owner_id";

    ALTER TABLE "founders" DROP COLUMN IF EXISTS "_verification_token";
    ALTER TABLE "founders" DROP COLUMN IF EXISTS "_verified";

    ALTER TABLE "founders" ADD COLUMN IF NOT EXISTS "owner_id" integer;
    ALTER TABLE "founders" ADD CONSTRAINT "founders_owner_id_founders_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."founders"("id") ON DELETE set null ON UPDATE no action;
    CREATE INDEX IF NOT EXISTS "founders_owner_idx" ON "founders" USING btree ("owner_id");

    DROP INDEX IF EXISTS "founders_needs_review_idx";
    ALTER TABLE "founders" DROP COLUMN IF EXISTS "needs_review";
  `)
}
