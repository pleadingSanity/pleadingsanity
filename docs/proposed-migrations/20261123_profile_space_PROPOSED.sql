-- PROPOSED — NOT APPLIED. Do not move into netlify/database/migrations/ until Shane
-- approves. Review needed for: column names, limits, and the public read path.
--
-- Context (read-only check, 23 Nov 2026):
--   * The "profiles" table lives in Netlify DB (Postgres, drizzle: db/schema.ts),
--     not Supabase. Both Supabase projects (supabase-cerulean-mirror,
--     supabase-copper-notebook) only hold arron_chat_memory / kb_* tables.
--   * P.S Space (js/ps-space.js) currently saves to localStorage key "ps-space-v1".
--     This migration would let a signed-in member sync it to their account and
--     show it on /@username when page_visibility allows.
--
-- Additive only: new nullable/defaulted columns, no drops, no RLS or policy changes.

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS space_theme      text    NOT NULL DEFAULT 'deep-space',
  ADD COLUMN IF NOT EXISTS space_cover      text    NOT NULL DEFAULT 'brain-nebula',
  ADD COLUMN IF NOT EXISTS space_song_id    text    NOT NULL DEFAULT '',   -- id from data/ps-playlists.json only
  ADD COLUMN IF NOT EXISTS space_top8       text[]  NOT NULL DEFAULT '{}'::text[],
  ADD COLUMN IF NOT EXISTS space_links      text[]  NOT NULL DEFAULT '{}'::text[], -- https only, max 4
  ADD COLUMN IF NOT EXISTS space_public     boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS space_updated_at timestamp;

ALTER TABLE profiles
  ADD CONSTRAINT profiles_space_theme_chk CHECK (space_theme IN
    ('deep-space','chrome','aurora','ember','ice','mono','sunrise','neon')),
  ADD CONSTRAINT profiles_space_top8_len_chk  CHECK (coalesce(array_length(space_top8, 1), 0) <= 8),
  ADD CONSTRAINT profiles_space_links_len_chk CHECK (coalesce(array_length(space_links, 1), 0) <= 4);

-- Existing columns reused (no change): bio, status_text (mood line), display_name,
-- page_visibility. Matching drizzle additions for db/schema.ts would be:
--   spaceTheme: text("space_theme").notNull().default("deep-space"),
--   spaceCover: text("space_cover").notNull().default("brain-nebula"),
--   spaceSongId: text("space_song_id").notNull().default(""),
--   spaceTop8: text("space_top8").array().notNull().default(sql`'{}'::text[]`),
--   spaceLinks: text("space_links").array().notNull().default(sql`'{}'::text[]`),
--   spacePublic: boolean("space_public").notNull().default(false),
--   spaceUpdatedAt: timestamp("space_updated_at"),
-- The API route (netlify/lib/social.ts) would also need to validate song ids
-- against the approved library and links as https before saving. Not done here.
