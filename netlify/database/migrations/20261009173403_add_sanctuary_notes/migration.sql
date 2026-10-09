CREATE TABLE "sanctuary_notes" (
	"id" serial PRIMARY KEY,
	"user_id" text NOT NULL,
	"title" text DEFAULT '' NOT NULL,
	"content" text NOT NULL,
	"category" text DEFAULT 'thought' NOT NULL,
	"pinned" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "sanctuary_notes_user_idx" ON "sanctuary_notes" ("user_id","id");--> statement-breakpoint
ALTER TABLE "sanctuary_notes" ADD CONSTRAINT "sanctuary_notes_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;