CREATE TABLE "creations" (
	"id" serial PRIMARY KEY,
	"author_id" text NOT NULL,
	"prompt" text NOT NULL,
	"title" text DEFAULT '' NOT NULL,
	"image_key" text NOT NULL,
	"model" text DEFAULT '' NOT NULL,
	"shared" boolean DEFAULT false NOT NULL,
	"hidden" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "game_progress" (
	"user_id" text,
	"game" text,
	"data" jsonb DEFAULT '{}' NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "game_progress_pkey" PRIMARY KEY("user_id","game")
);
--> statement-breakpoint
CREATE TABLE "saves" (
	"user_id" text,
	"post_id" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "saves_pkey" PRIMARY KEY("user_id","post_id")
);
--> statement-breakpoint
CREATE TABLE "site_content" (
	"id" serial PRIMARY KEY,
	"author_id" text,
	"credit" text NOT NULL,
	"kind" text NOT NULL,
	"title" text DEFAULT '' NOT NULL,
	"body" text NOT NULL,
	"truth_tag" text DEFAULT 'experience' NOT NULL,
	"anonymous" boolean DEFAULT false NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"review_note" text DEFAULT '' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"published_at" timestamp
);
--> statement-breakpoint
ALTER TABLE "posts" ADD COLUMN "truth_tag" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "posts" ADD COLUMN "pinned" boolean DEFAULT false NOT NULL;--> statement-breakpoint
CREATE INDEX "creations_author_idx" ON "creations" ("author_id","id");--> statement-breakpoint
CREATE INDEX "creations_gallery_idx" ON "creations" ("shared","hidden","id");--> statement-breakpoint
CREATE INDEX "saves_user_idx" ON "saves" ("user_id","created_at");--> statement-breakpoint
CREATE INDEX "site_content_status_idx" ON "site_content" ("status","kind","id");--> statement-breakpoint
ALTER TABLE "creations" ADD CONSTRAINT "creations_author_id_users_id_fkey" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "game_progress" ADD CONSTRAINT "game_progress_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "saves" ADD CONSTRAINT "saves_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "saves" ADD CONSTRAINT "saves_post_id_posts_id_fkey" FOREIGN KEY ("post_id") REFERENCES "posts"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "site_content" ADD CONSTRAINT "site_content_author_id_users_id_fkey" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE SET NULL;