CREATE TABLE "test_lab_items" (
	"id" text PRIMARY KEY,
	"title" text NOT NULL,
	"what" text NOT NULL,
	"href" text NOT NULL,
	"page" text DEFAULT '' NOT NULL,
	"area" text DEFAULT '' NOT NULL,
	"source" text DEFAULT 'seed' NOT NULL,
	"status" text DEFAULT 'open' NOT NULL,
	"resolved_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "test_lab_feedback" (
	"id" serial PRIMARY KEY,
	"item_id" text,
	"status" text DEFAULT 'note' NOT NULL,
	"notes" text DEFAULT '' NOT NULL,
	"page" text DEFAULT '' NOT NULL,
	"user_id" text NOT NULL,
	"screenshot" text DEFAULT '' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "test_lab_feedback_item_idx" ON "test_lab_feedback" ("item_id","id");
--> statement-breakpoint
ALTER TABLE "test_lab_feedback" ADD CONSTRAINT "test_lab_feedback_item_id_test_lab_items_id_fkey" FOREIGN KEY ("item_id") REFERENCES "test_lab_items"("id") ON DELETE set null;
--> statement-breakpoint
ALTER TABLE "test_lab_feedback" ADD CONSTRAINT "test_lab_feedback_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE cascade;
