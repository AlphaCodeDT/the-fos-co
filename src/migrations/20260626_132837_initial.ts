import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_users_role" AS ENUM('admin', 'editor');
  CREATE TYPE "public"."enum_founders_gender" AS ENUM('female', 'male', 'non-binary', 'prefer-not-to-say', 'other');
  CREATE TYPE "public"."enum_founders_moderation_status" AS ENUM('draft', 'pending', 'approved');
  CREATE TYPE "public"."enum_founders_verification_status" AS ENUM('pending', 'verified', 'rejected');
  CREATE TYPE "public"."enum_founders_verification_source_type" AS ENUM('organization', 'manual');
  CREATE TYPE "public"."enum_stories_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__stories_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_organizations_type" AS ENUM('incubator', 'accelerator', 'community', 'university', 'government-program');
  CREATE TYPE "public"."enum_startups_team_role" AS ENUM('founder', 'co-founder', 'ceo', 'cto', 'cpo', 'advisor');
  CREATE TYPE "public"."enum_startups_opportunities_type" AS ENUM('job', 'internship', 'co-founder', 'partnership');
  CREATE TYPE "public"."enum_startups_stage" AS ENUM('idea', 'mvp', 'early-revenue', 'growth', 'scaling');
  CREATE TYPE "public"."enum_startups_claim_claim_status" AS ENUM('unclaimed', 'pending', 'claimed');
  CREATE TYPE "public"."enum_startups_moderation_status" AS ENUM('draft', 'pending', 'approved');
  CREATE TYPE "public"."enum_startups_verification_status" AS ENUM('pending', 'verified', 'rejected');
  CREATE TABLE "users_sessions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"created_at" timestamp(3) with time zone,
  	"expires_at" timestamp(3) with time zone NOT NULL
  );
  
  CREATE TABLE "users" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"slug" varchar NOT NULL,
  	"bio" varchar,
  	"avatar_id" integer,
  	"role" "enum_users_role" DEFAULT 'editor' NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"email" varchar NOT NULL,
  	"reset_password_token" varchar,
  	"reset_password_expiration" timestamp(3) with time zone,
  	"salt" varchar,
  	"hash" varchar,
  	"login_attempts" numeric DEFAULT 0,
  	"lock_until" timestamp(3) with time zone
  );
  
  CREATE TABLE "founders_sessions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"created_at" timestamp(3) with time zone,
  	"expires_at" timestamp(3) with time zone NOT NULL
  );
  
  CREATE TABLE "founders" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"slug" varchar NOT NULL,
  	"headline" varchar,
  	"bio" varchar,
  	"avatar_id" integer,
  	"gender" "enum_founders_gender",
  	"city" varchar,
  	"state" varchar,
  	"country" varchar,
  	"linked_in" varchar,
  	"twitter" varchar,
  	"website" varchar,
  	"looking_for_co_founder" boolean DEFAULT false,
  	"open_to_opportunities" boolean DEFAULT false,
  	"owner_id" integer,
  	"moderation_status" "enum_founders_moderation_status" DEFAULT 'draft' NOT NULL,
  	"verification_status" "enum_founders_verification_status" DEFAULT 'pending' NOT NULL,
  	"verification_source_type" "enum_founders_verification_source_type",
  	"verification_source_organization_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"email" varchar NOT NULL,
  	"reset_password_token" varchar,
  	"reset_password_expiration" timestamp(3) with time zone,
  	"salt" varchar,
  	"hash" varchar,
  	"login_attempts" numeric DEFAULT 0,
  	"lock_until" timestamp(3) with time zone
  );
  
  CREATE TABLE "founders_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"industries_id" integer,
  	"organizations_id" integer,
  	"startups_id" integer
  );
  
  CREATE TABLE "media" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"alt" varchar NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"url" varchar,
  	"thumbnail_u_r_l" varchar,
  	"filename" varchar,
  	"mime_type" varchar,
  	"filesize" numeric,
  	"width" numeric,
  	"height" numeric,
  	"focal_x" numeric,
  	"focal_y" numeric,
  	"sizes_thumb_url" varchar,
  	"sizes_thumb_width" numeric,
  	"sizes_thumb_height" numeric,
  	"sizes_thumb_mime_type" varchar,
  	"sizes_thumb_filesize" numeric,
  	"sizes_thumb_filename" varchar,
  	"sizes_card_url" varchar,
  	"sizes_card_width" numeric,
  	"sizes_card_height" numeric,
  	"sizes_card_mime_type" varchar,
  	"sizes_card_filesize" numeric,
  	"sizes_card_filename" varchar,
  	"sizes_og_url" varchar,
  	"sizes_og_width" numeric,
  	"sizes_og_height" numeric,
  	"sizes_og_mime_type" varchar,
  	"sizes_og_filesize" numeric,
  	"sizes_og_filename" varchar
  );
  
  CREATE TABLE "stories" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"slug" varchar,
  	"excerpt" varchar,
  	"content" jsonb,
  	"featured_image_id" integer,
  	"author_id" integer,
  	"category_id" integer,
  	"published_date" timestamp(3) with time zone,
  	"seo_seo_title" varchar,
  	"seo_seo_description" varchar,
  	"seo_canonical_url" varchar,
  	"seo_noindex" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_stories_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "stories_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"tags_id" integer
  );
  
  CREATE TABLE "_stories_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_title" varchar,
  	"version_slug" varchar,
  	"version_excerpt" varchar,
  	"version_content" jsonb,
  	"version_featured_image_id" integer,
  	"version_author_id" integer,
  	"version_category_id" integer,
  	"version_published_date" timestamp(3) with time zone,
  	"version_seo_seo_title" varchar,
  	"version_seo_seo_description" varchar,
  	"version_seo_canonical_url" varchar,
  	"version_seo_noindex" boolean DEFAULT false,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__stories_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE "_stories_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"tags_id" integer
  );
  
  CREATE TABLE "categories" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"slug" varchar NOT NULL,
  	"description" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "tags" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"slug" varchar NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "industries" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"slug" varchar NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "organizations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"slug" varchar NOT NULL,
  	"type" "enum_organizations_type" NOT NULL,
  	"location" varchar,
  	"website" varchar,
  	"logo_id" integer,
  	"parent_organization_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "startups_team" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"founder_id" integer NOT NULL,
  	"role" "enum_startups_team_role" NOT NULL,
  	"is_primary" boolean DEFAULT false
  );
  
  CREATE TABLE "startups_opportunities" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"type" "enum_startups_opportunities_type" NOT NULL,
  	"title" varchar NOT NULL,
  	"description" varchar,
  	"link" varchar
  );
  
  CREATE TABLE "startups" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"slug" varchar NOT NULL,
  	"logo_id" integer,
  	"tagline" varchar,
  	"description" varchar,
  	"website" varchar,
  	"industry_id" integer,
  	"stage" "enum_startups_stage",
  	"city" varchar,
  	"state" varchar,
  	"country" varchar,
  	"team_size" numeric,
  	"funding_status" varchar,
  	"founded_year" numeric,
  	"women_led" boolean DEFAULT false,
  	"is_hiring" boolean DEFAULT false,
  	"is_raising" boolean DEFAULT false,
  	"is_looking_for_co_founder" boolean DEFAULT false,
  	"claim_claimed_by_id" integer,
  	"claim_claimed_at" timestamp(3) with time zone,
  	"claim_claim_status" "enum_startups_claim_claim_status" DEFAULT 'unclaimed',
  	"moderation_status" "enum_startups_moderation_status" DEFAULT 'draft' NOT NULL,
  	"verification_status" "enum_startups_verification_status" DEFAULT 'pending' NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "startups_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"organizations_id" integer
  );
  
  CREATE TABLE "payload_kv" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar NOT NULL,
  	"data" jsonb NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"global_slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer,
  	"founders_id" integer,
  	"media_id" integer,
  	"stories_id" integer,
  	"categories_id" integer,
  	"tags_id" integer,
  	"industries_id" integer,
  	"organizations_id" integer,
  	"startups_id" integer
  );
  
  CREATE TABLE "payload_preferences" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar,
  	"value" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_preferences_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer,
  	"founders_id" integer
  );
  
  CREATE TABLE "payload_migrations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"batch" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "users_sessions" ADD CONSTRAINT "users_sessions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "users" ADD CONSTRAINT "users_avatar_id_media_id_fk" FOREIGN KEY ("avatar_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "founders_sessions" ADD CONSTRAINT "founders_sessions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."founders"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "founders" ADD CONSTRAINT "founders_avatar_id_media_id_fk" FOREIGN KEY ("avatar_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "founders" ADD CONSTRAINT "founders_owner_id_founders_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."founders"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "founders" ADD CONSTRAINT "founders_verification_source_organization_id_organizations_id_fk" FOREIGN KEY ("verification_source_organization_id") REFERENCES "public"."organizations"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "founders_rels" ADD CONSTRAINT "founders_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."founders"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "founders_rels" ADD CONSTRAINT "founders_rels_industries_fk" FOREIGN KEY ("industries_id") REFERENCES "public"."industries"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "founders_rels" ADD CONSTRAINT "founders_rels_organizations_fk" FOREIGN KEY ("organizations_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "founders_rels" ADD CONSTRAINT "founders_rels_startups_fk" FOREIGN KEY ("startups_id") REFERENCES "public"."startups"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "stories" ADD CONSTRAINT "stories_featured_image_id_media_id_fk" FOREIGN KEY ("featured_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "stories" ADD CONSTRAINT "stories_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "stories" ADD CONSTRAINT "stories_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "stories_rels" ADD CONSTRAINT "stories_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."stories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "stories_rels" ADD CONSTRAINT "stories_rels_tags_fk" FOREIGN KEY ("tags_id") REFERENCES "public"."tags"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_stories_v" ADD CONSTRAINT "_stories_v_parent_id_stories_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."stories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_stories_v" ADD CONSTRAINT "_stories_v_version_featured_image_id_media_id_fk" FOREIGN KEY ("version_featured_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_stories_v" ADD CONSTRAINT "_stories_v_version_author_id_users_id_fk" FOREIGN KEY ("version_author_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_stories_v" ADD CONSTRAINT "_stories_v_version_category_id_categories_id_fk" FOREIGN KEY ("version_category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_stories_v_rels" ADD CONSTRAINT "_stories_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_stories_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_stories_v_rels" ADD CONSTRAINT "_stories_v_rels_tags_fk" FOREIGN KEY ("tags_id") REFERENCES "public"."tags"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "organizations" ADD CONSTRAINT "organizations_logo_id_media_id_fk" FOREIGN KEY ("logo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "organizations" ADD CONSTRAINT "organizations_parent_organization_id_organizations_id_fk" FOREIGN KEY ("parent_organization_id") REFERENCES "public"."organizations"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "startups_team" ADD CONSTRAINT "startups_team_founder_id_founders_id_fk" FOREIGN KEY ("founder_id") REFERENCES "public"."founders"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "startups_team" ADD CONSTRAINT "startups_team_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."startups"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "startups_opportunities" ADD CONSTRAINT "startups_opportunities_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."startups"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "startups" ADD CONSTRAINT "startups_logo_id_media_id_fk" FOREIGN KEY ("logo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "startups" ADD CONSTRAINT "startups_industry_id_industries_id_fk" FOREIGN KEY ("industry_id") REFERENCES "public"."industries"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "startups" ADD CONSTRAINT "startups_claim_claimed_by_id_founders_id_fk" FOREIGN KEY ("claim_claimed_by_id") REFERENCES "public"."founders"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "startups_rels" ADD CONSTRAINT "startups_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."startups"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "startups_rels" ADD CONSTRAINT "startups_rels_organizations_fk" FOREIGN KEY ("organizations_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_locked_documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_founders_fk" FOREIGN KEY ("founders_id") REFERENCES "public"."founders"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_stories_fk" FOREIGN KEY ("stories_id") REFERENCES "public"."stories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_categories_fk" FOREIGN KEY ("categories_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_tags_fk" FOREIGN KEY ("tags_id") REFERENCES "public"."tags"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_industries_fk" FOREIGN KEY ("industries_id") REFERENCES "public"."industries"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_organizations_fk" FOREIGN KEY ("organizations_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_startups_fk" FOREIGN KEY ("startups_id") REFERENCES "public"."startups"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_preferences"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_founders_fk" FOREIGN KEY ("founders_id") REFERENCES "public"."founders"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "users_sessions_order_idx" ON "users_sessions" USING btree ("_order");
  CREATE INDEX "users_sessions_parent_id_idx" ON "users_sessions" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "users_slug_idx" ON "users" USING btree ("slug");
  CREATE INDEX "users_avatar_idx" ON "users" USING btree ("avatar_id");
  CREATE INDEX "users_updated_at_idx" ON "users" USING btree ("updated_at");
  CREATE INDEX "users_created_at_idx" ON "users" USING btree ("created_at");
  CREATE UNIQUE INDEX "users_email_idx" ON "users" USING btree ("email");
  CREATE INDEX "founders_sessions_order_idx" ON "founders_sessions" USING btree ("_order");
  CREATE INDEX "founders_sessions_parent_id_idx" ON "founders_sessions" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "founders_slug_idx" ON "founders" USING btree ("slug");
  CREATE INDEX "founders_avatar_idx" ON "founders" USING btree ("avatar_id");
  CREATE INDEX "founders_city_idx" ON "founders" USING btree ("city");
  CREATE INDEX "founders_owner_idx" ON "founders" USING btree ("owner_id");
  CREATE INDEX "founders_moderation_status_idx" ON "founders" USING btree ("moderation_status");
  CREATE INDEX "founders_verification_status_idx" ON "founders" USING btree ("verification_status");
  CREATE INDEX "founders_verification_source_verification_source_organiz_idx" ON "founders" USING btree ("verification_source_organization_id");
  CREATE INDEX "founders_updated_at_idx" ON "founders" USING btree ("updated_at");
  CREATE INDEX "founders_created_at_idx" ON "founders" USING btree ("created_at");
  CREATE UNIQUE INDEX "founders_email_idx" ON "founders" USING btree ("email");
  CREATE INDEX "city_idx" ON "founders" USING btree ("city");
  CREATE INDEX "moderationStatus_idx" ON "founders" USING btree ("moderation_status");
  CREATE INDEX "verificationStatus_idx" ON "founders" USING btree ("verification_status");
  CREATE INDEX "founders_rels_order_idx" ON "founders_rels" USING btree ("order");
  CREATE INDEX "founders_rels_parent_idx" ON "founders_rels" USING btree ("parent_id");
  CREATE INDEX "founders_rels_path_idx" ON "founders_rels" USING btree ("path");
  CREATE INDEX "founders_rels_industries_id_idx" ON "founders_rels" USING btree ("industries_id");
  CREATE INDEX "founders_rels_organizations_id_idx" ON "founders_rels" USING btree ("organizations_id");
  CREATE INDEX "founders_rels_startups_id_idx" ON "founders_rels" USING btree ("startups_id");
  CREATE INDEX "media_updated_at_idx" ON "media" USING btree ("updated_at");
  CREATE INDEX "media_created_at_idx" ON "media" USING btree ("created_at");
  CREATE UNIQUE INDEX "media_filename_idx" ON "media" USING btree ("filename");
  CREATE INDEX "media_sizes_thumb_sizes_thumb_filename_idx" ON "media" USING btree ("sizes_thumb_filename");
  CREATE INDEX "media_sizes_card_sizes_card_filename_idx" ON "media" USING btree ("sizes_card_filename");
  CREATE INDEX "media_sizes_og_sizes_og_filename_idx" ON "media" USING btree ("sizes_og_filename");
  CREATE UNIQUE INDEX "stories_slug_idx" ON "stories" USING btree ("slug");
  CREATE INDEX "stories_featured_image_idx" ON "stories" USING btree ("featured_image_id");
  CREATE INDEX "stories_author_idx" ON "stories" USING btree ("author_id");
  CREATE INDEX "stories_category_idx" ON "stories" USING btree ("category_id");
  CREATE INDEX "stories_updated_at_idx" ON "stories" USING btree ("updated_at");
  CREATE INDEX "stories_created_at_idx" ON "stories" USING btree ("created_at");
  CREATE INDEX "stories__status_idx" ON "stories" USING btree ("_status");
  CREATE INDEX "stories_rels_order_idx" ON "stories_rels" USING btree ("order");
  CREATE INDEX "stories_rels_parent_idx" ON "stories_rels" USING btree ("parent_id");
  CREATE INDEX "stories_rels_path_idx" ON "stories_rels" USING btree ("path");
  CREATE INDEX "stories_rels_tags_id_idx" ON "stories_rels" USING btree ("tags_id");
  CREATE INDEX "_stories_v_parent_idx" ON "_stories_v" USING btree ("parent_id");
  CREATE INDEX "_stories_v_version_version_slug_idx" ON "_stories_v" USING btree ("version_slug");
  CREATE INDEX "_stories_v_version_version_featured_image_idx" ON "_stories_v" USING btree ("version_featured_image_id");
  CREATE INDEX "_stories_v_version_version_author_idx" ON "_stories_v" USING btree ("version_author_id");
  CREATE INDEX "_stories_v_version_version_category_idx" ON "_stories_v" USING btree ("version_category_id");
  CREATE INDEX "_stories_v_version_version_updated_at_idx" ON "_stories_v" USING btree ("version_updated_at");
  CREATE INDEX "_stories_v_version_version_created_at_idx" ON "_stories_v" USING btree ("version_created_at");
  CREATE INDEX "_stories_v_version_version__status_idx" ON "_stories_v" USING btree ("version__status");
  CREATE INDEX "_stories_v_created_at_idx" ON "_stories_v" USING btree ("created_at");
  CREATE INDEX "_stories_v_updated_at_idx" ON "_stories_v" USING btree ("updated_at");
  CREATE INDEX "_stories_v_latest_idx" ON "_stories_v" USING btree ("latest");
  CREATE INDEX "_stories_v_rels_order_idx" ON "_stories_v_rels" USING btree ("order");
  CREATE INDEX "_stories_v_rels_parent_idx" ON "_stories_v_rels" USING btree ("parent_id");
  CREATE INDEX "_stories_v_rels_path_idx" ON "_stories_v_rels" USING btree ("path");
  CREATE INDEX "_stories_v_rels_tags_id_idx" ON "_stories_v_rels" USING btree ("tags_id");
  CREATE UNIQUE INDEX "categories_slug_idx" ON "categories" USING btree ("slug");
  CREATE INDEX "categories_updated_at_idx" ON "categories" USING btree ("updated_at");
  CREATE INDEX "categories_created_at_idx" ON "categories" USING btree ("created_at");
  CREATE UNIQUE INDEX "tags_slug_idx" ON "tags" USING btree ("slug");
  CREATE INDEX "tags_updated_at_idx" ON "tags" USING btree ("updated_at");
  CREATE INDEX "tags_created_at_idx" ON "tags" USING btree ("created_at");
  CREATE UNIQUE INDEX "industries_slug_idx" ON "industries" USING btree ("slug");
  CREATE INDEX "industries_updated_at_idx" ON "industries" USING btree ("updated_at");
  CREATE INDEX "industries_created_at_idx" ON "industries" USING btree ("created_at");
  CREATE UNIQUE INDEX "organizations_slug_idx" ON "organizations" USING btree ("slug");
  CREATE INDEX "organizations_logo_idx" ON "organizations" USING btree ("logo_id");
  CREATE INDEX "organizations_parent_organization_idx" ON "organizations" USING btree ("parent_organization_id");
  CREATE INDEX "organizations_updated_at_idx" ON "organizations" USING btree ("updated_at");
  CREATE INDEX "organizations_created_at_idx" ON "organizations" USING btree ("created_at");
  CREATE INDEX "startups_team_order_idx" ON "startups_team" USING btree ("_order");
  CREATE INDEX "startups_team_parent_id_idx" ON "startups_team" USING btree ("_parent_id");
  CREATE INDEX "startups_team_founder_idx" ON "startups_team" USING btree ("founder_id");
  CREATE INDEX "startups_opportunities_order_idx" ON "startups_opportunities" USING btree ("_order");
  CREATE INDEX "startups_opportunities_parent_id_idx" ON "startups_opportunities" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "startups_slug_idx" ON "startups" USING btree ("slug");
  CREATE INDEX "startups_logo_idx" ON "startups" USING btree ("logo_id");
  CREATE INDEX "startups_industry_idx" ON "startups" USING btree ("industry_id");
  CREATE INDEX "startups_stage_idx" ON "startups" USING btree ("stage");
  CREATE INDEX "startups_city_idx" ON "startups" USING btree ("city");
  CREATE INDEX "startups_women_led_idx" ON "startups" USING btree ("women_led");
  CREATE INDEX "startups_is_hiring_idx" ON "startups" USING btree ("is_hiring");
  CREATE INDEX "startups_is_raising_idx" ON "startups" USING btree ("is_raising");
  CREATE INDEX "startups_claim_claim_claimed_by_idx" ON "startups" USING btree ("claim_claimed_by_id");
  CREATE INDEX "startups_claim_claim_claim_status_idx" ON "startups" USING btree ("claim_claim_status");
  CREATE INDEX "startups_moderation_status_idx" ON "startups" USING btree ("moderation_status");
  CREATE INDEX "startups_verification_status_idx" ON "startups" USING btree ("verification_status");
  CREATE INDEX "startups_updated_at_idx" ON "startups" USING btree ("updated_at");
  CREATE INDEX "startups_created_at_idx" ON "startups" USING btree ("created_at");
  CREATE INDEX "stage_idx" ON "startups" USING btree ("stage");
  CREATE INDEX "city_1_idx" ON "startups" USING btree ("city");
  CREATE INDEX "industry_idx" ON "startups" USING btree ("industry_id");
  CREATE INDEX "isHiring_idx" ON "startups" USING btree ("is_hiring");
  CREATE INDEX "isRaising_idx" ON "startups" USING btree ("is_raising");
  CREATE INDEX "womenLed_idx" ON "startups" USING btree ("women_led");
  CREATE INDEX "moderationStatus_1_idx" ON "startups" USING btree ("moderation_status");
  CREATE INDEX "verificationStatus_1_idx" ON "startups" USING btree ("verification_status");
  CREATE INDEX "claim_claimStatus_idx" ON "startups" USING btree ("claim_claim_status");
  CREATE INDEX "startups_rels_order_idx" ON "startups_rels" USING btree ("order");
  CREATE INDEX "startups_rels_parent_idx" ON "startups_rels" USING btree ("parent_id");
  CREATE INDEX "startups_rels_path_idx" ON "startups_rels" USING btree ("path");
  CREATE INDEX "startups_rels_organizations_id_idx" ON "startups_rels" USING btree ("organizations_id");
  CREATE UNIQUE INDEX "payload_kv_key_idx" ON "payload_kv" USING btree ("key");
  CREATE INDEX "payload_locked_documents_global_slug_idx" ON "payload_locked_documents" USING btree ("global_slug");
  CREATE INDEX "payload_locked_documents_updated_at_idx" ON "payload_locked_documents" USING btree ("updated_at");
  CREATE INDEX "payload_locked_documents_created_at_idx" ON "payload_locked_documents" USING btree ("created_at");
  CREATE INDEX "payload_locked_documents_rels_order_idx" ON "payload_locked_documents_rels" USING btree ("order");
  CREATE INDEX "payload_locked_documents_rels_parent_idx" ON "payload_locked_documents_rels" USING btree ("parent_id");
  CREATE INDEX "payload_locked_documents_rels_path_idx" ON "payload_locked_documents_rels" USING btree ("path");
  CREATE INDEX "payload_locked_documents_rels_users_id_idx" ON "payload_locked_documents_rels" USING btree ("users_id");
  CREATE INDEX "payload_locked_documents_rels_founders_id_idx" ON "payload_locked_documents_rels" USING btree ("founders_id");
  CREATE INDEX "payload_locked_documents_rels_media_id_idx" ON "payload_locked_documents_rels" USING btree ("media_id");
  CREATE INDEX "payload_locked_documents_rels_stories_id_idx" ON "payload_locked_documents_rels" USING btree ("stories_id");
  CREATE INDEX "payload_locked_documents_rels_categories_id_idx" ON "payload_locked_documents_rels" USING btree ("categories_id");
  CREATE INDEX "payload_locked_documents_rels_tags_id_idx" ON "payload_locked_documents_rels" USING btree ("tags_id");
  CREATE INDEX "payload_locked_documents_rels_industries_id_idx" ON "payload_locked_documents_rels" USING btree ("industries_id");
  CREATE INDEX "payload_locked_documents_rels_organizations_id_idx" ON "payload_locked_documents_rels" USING btree ("organizations_id");
  CREATE INDEX "payload_locked_documents_rels_startups_id_idx" ON "payload_locked_documents_rels" USING btree ("startups_id");
  CREATE INDEX "payload_preferences_key_idx" ON "payload_preferences" USING btree ("key");
  CREATE INDEX "payload_preferences_updated_at_idx" ON "payload_preferences" USING btree ("updated_at");
  CREATE INDEX "payload_preferences_created_at_idx" ON "payload_preferences" USING btree ("created_at");
  CREATE INDEX "payload_preferences_rels_order_idx" ON "payload_preferences_rels" USING btree ("order");
  CREATE INDEX "payload_preferences_rels_parent_idx" ON "payload_preferences_rels" USING btree ("parent_id");
  CREATE INDEX "payload_preferences_rels_path_idx" ON "payload_preferences_rels" USING btree ("path");
  CREATE INDEX "payload_preferences_rels_users_id_idx" ON "payload_preferences_rels" USING btree ("users_id");
  CREATE INDEX "payload_preferences_rels_founders_id_idx" ON "payload_preferences_rels" USING btree ("founders_id");
  CREATE INDEX "payload_migrations_updated_at_idx" ON "payload_migrations" USING btree ("updated_at");
  CREATE INDEX "payload_migrations_created_at_idx" ON "payload_migrations" USING btree ("created_at");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "users_sessions" CASCADE;
  DROP TABLE "users" CASCADE;
  DROP TABLE "founders_sessions" CASCADE;
  DROP TABLE "founders" CASCADE;
  DROP TABLE "founders_rels" CASCADE;
  DROP TABLE "media" CASCADE;
  DROP TABLE "stories" CASCADE;
  DROP TABLE "stories_rels" CASCADE;
  DROP TABLE "_stories_v" CASCADE;
  DROP TABLE "_stories_v_rels" CASCADE;
  DROP TABLE "categories" CASCADE;
  DROP TABLE "tags" CASCADE;
  DROP TABLE "industries" CASCADE;
  DROP TABLE "organizations" CASCADE;
  DROP TABLE "startups_team" CASCADE;
  DROP TABLE "startups_opportunities" CASCADE;
  DROP TABLE "startups" CASCADE;
  DROP TABLE "startups_rels" CASCADE;
  DROP TABLE "payload_kv" CASCADE;
  DROP TABLE "payload_locked_documents" CASCADE;
  DROP TABLE "payload_locked_documents_rels" CASCADE;
  DROP TABLE "payload_preferences" CASCADE;
  DROP TABLE "payload_preferences_rels" CASCADE;
  DROP TABLE "payload_migrations" CASCADE;
  DROP TYPE "public"."enum_users_role";
  DROP TYPE "public"."enum_founders_gender";
  DROP TYPE "public"."enum_founders_moderation_status";
  DROP TYPE "public"."enum_founders_verification_status";
  DROP TYPE "public"."enum_founders_verification_source_type";
  DROP TYPE "public"."enum_stories_status";
  DROP TYPE "public"."enum__stories_v_version_status";
  DROP TYPE "public"."enum_organizations_type";
  DROP TYPE "public"."enum_startups_team_role";
  DROP TYPE "public"."enum_startups_opportunities_type";
  DROP TYPE "public"."enum_startups_stage";
  DROP TYPE "public"."enum_startups_claim_claim_status";
  DROP TYPE "public"."enum_startups_moderation_status";
  DROP TYPE "public"."enum_startups_verification_status";`)
}
