CREATE TABLE "ai_stories" (
	"id" serial PRIMARY KEY,
	"author_id" text NOT NULL,
	"kind" text DEFAULT 'inspiring' NOT NULL,
	"title" text DEFAULT '' NOT NULL,
	"user_line" text DEFAULT '' NOT NULL,
	"arron_line" text NOT NULL,
	"reflection" text DEFAULT '' NOT NULL,
	"anonymous" boolean DEFAULT false NOT NULL,
	"content_warning" boolean DEFAULT false NOT NULL,
	"hidden" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ai_story_hearts" (
	"story_id" integer,
	"voter" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "ai_story_hearts_pkey" PRIMARY KEY("story_id","voter")
);
--> statement-breakpoint
CREATE INDEX "ai_stories_created_idx" ON "ai_stories" ("hidden","id");--> statement-breakpoint
CREATE INDEX "ai_stories_kind_idx" ON "ai_stories" ("kind","id");--> statement-breakpoint
ALTER TABLE "ai_stories" ADD CONSTRAINT "ai_stories_author_id_users_id_fkey" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "ai_story_hearts" ADD CONSTRAINT "ai_story_hearts_story_id_ai_stories_id_fkey" FOREIGN KEY ("story_id") REFERENCES "ai_stories"("id") ON DELETE CASCADE;