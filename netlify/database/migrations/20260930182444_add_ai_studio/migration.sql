CREATE TABLE "studio_items" (
	"id" serial PRIMARY KEY,
	"kind" text NOT NULL,
	"author_id" text,
	"author_label" text NOT NULL,
	"model" text,
	"style" text DEFAULT '' NOT NULL,
	"topic" text DEFAULT '' NOT NULL,
	"title" text DEFAULT '' NOT NULL,
	"body" text DEFAULT '' NOT NULL,
	"script" jsonb,
	"day" text,
	"hidden" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "studio_usage" (
	"key" text PRIMARY KEY,
	"count" integer DEFAULT 0 NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "studio_votes" (
	"item_id" integer,
	"voter" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "studio_votes_pkey" PRIMARY KEY("item_id","voter")
);
--> statement-breakpoint
CREATE INDEX "studio_items_kind_idx" ON "studio_items" ("kind","id");--> statement-breakpoint
CREATE INDEX "studio_items_day_idx" ON "studio_items" ("kind","day");--> statement-breakpoint
ALTER TABLE "studio_items" ADD CONSTRAINT "studio_items_author_id_users_id_fkey" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "studio_votes" ADD CONSTRAINT "studio_votes_item_id_studio_items_id_fkey" FOREIGN KEY ("item_id") REFERENCES "studio_items"("id") ON DELETE CASCADE;