CREATE TABLE "memories" (
	"code" text PRIMARY KEY,
	"story" text DEFAULT '' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
