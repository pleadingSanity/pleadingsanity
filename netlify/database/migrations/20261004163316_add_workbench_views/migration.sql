CREATE TABLE "site_proposals" (
	"id" serial PRIMARY KEY,
	"kind" text DEFAULT 'page' NOT NULL,
	"target" text DEFAULT '' NOT NULL,
	"title" text NOT NULL,
	"why" text DEFAULT '' NOT NULL,
	"body" text NOT NULL,
	"status" text DEFAULT 'proposed' NOT NULL,
	"live_href" text DEFAULT '' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "posts" ADD COLUMN "views" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
CREATE INDEX "site_proposals_status_idx" ON "site_proposals" ("status","id");