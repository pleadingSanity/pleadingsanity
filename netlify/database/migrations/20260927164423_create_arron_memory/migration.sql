CREATE TABLE "arron_memories" (
	"id" text PRIMARY KEY,
	"story" text DEFAULT '' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "arron_messages" (
	"id" serial PRIMARY KEY,
	"memory_id" text NOT NULL,
	"role" text NOT NULL,
	"content" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "arron_messages_memory_idx" ON "arron_messages" ("memory_id","id");--> statement-breakpoint
ALTER TABLE "arron_messages" ADD CONSTRAINT "arron_messages_memory_id_arron_memories_id_fkey" FOREIGN KEY ("memory_id") REFERENCES "arron_memories"("id") ON DELETE CASCADE;