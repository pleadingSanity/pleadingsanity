CREATE TABLE "rate_limits" (
	"key" text PRIMARY KEY,
	"window_start" integer NOT NULL,
	"count" integer DEFAULT 0 NOT NULL
);
