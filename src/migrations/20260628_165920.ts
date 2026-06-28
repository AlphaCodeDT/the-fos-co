import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_programs_mode" AS ENUM('online', 'in-person', 'hybrid');
  CREATE TYPE "public"."enum_programs_status" AS ENUM('draft', 'published');
  CREATE TABLE "programs" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"slug" varchar NOT NULL,
  	"organization_id" integer NOT NULL,
  	"description" varchar,
  	"cohort" varchar,
  	"start_date" timestamp(3) with time zone,
  	"end_date" timestamp(3) with time zone,
  	"application_deadline" timestamp(3) with time zone,
  	"application_url" varchar,
  	"mode" "enum_programs_mode",
  	"location" varchar,
  	"status" "enum_programs_status" DEFAULT 'draft' NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "programs_id" integer;
  ALTER TABLE "programs" ADD CONSTRAINT "programs_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE set null ON UPDATE no action;
  CREATE UNIQUE INDEX "programs_slug_idx" ON "programs" USING btree ("slug");
  CREATE INDEX "programs_organization_idx" ON "programs" USING btree ("organization_id");
  CREATE INDEX "programs_updated_at_idx" ON "programs" USING btree ("updated_at");
  CREATE INDEX "programs_created_at_idx" ON "programs" USING btree ("created_at");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_programs_fk" FOREIGN KEY ("programs_id") REFERENCES "public"."programs"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_programs_id_idx" ON "payload_locked_documents_rels" USING btree ("programs_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "programs" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "programs" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_programs_fk";
  
  DROP INDEX "payload_locked_documents_rels_programs_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "programs_id";
  DROP TYPE "public"."enum_programs_mode";
  DROP TYPE "public"."enum_programs_status";`)
}
