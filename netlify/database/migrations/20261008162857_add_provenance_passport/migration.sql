CREATE TABLE "passports" (
	"user_id" text PRIMARY KEY,
	"fields" jsonb DEFAULT '{}' NOT NULL,
	"ai_memory_allowed" boolean DEFAULT false NOT NULL,
	"personalise" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "posts" ADD COLUMN "origin" text DEFAULT 'human' NOT NULL;--> statement-breakpoint
ALTER TABLE "posts" ADD COLUMN "ai_provider" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "posts" ADD COLUMN "ai_model" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "posts" ADD COLUMN "human_reviewed" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "posts" ADD COLUMN "ai_memory_allowed" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "site_content" ADD COLUMN "origin" text DEFAULT 'human' NOT NULL;--> statement-breakpoint
ALTER TABLE "site_content" ADD COLUMN "ai_provider" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "site_content" ADD COLUMN "ai_model" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "site_content" ADD COLUMN "human_reviewed" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "passports" ADD CONSTRAINT "passports_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;