import { sql } from "drizzle-orm";
import {
  pgTable,
  serial,
  text,
  timestamp,
  index,
  uniqueIndex,
  integer,
  boolean,
  primaryKey,
  jsonb,
} from "drizzle-orm/pg-core";

// One row per Arron memory. The id is a random secret generated on the
// visitor's device — no names, emails or accounts are ever required.
export const arronMemories = pgTable("arron_memories", {
  id: text().primaryKey(),
  story: text().notNull().default(""),
  // Arron app sync: Core Truths, milestones and mood timeline as one JSON blob.
  vault: jsonb().notNull().default({}),
  // v3.1: a signed-in member's memory belongs to their account, so Arron
  // knows them on every device. Null for anonymous device memories.
  userId: text("user_id").unique().references(() => users.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const arronMessages = pgTable(
  "arron_messages",
  {
    id: serial().primaryKey(),
    memoryId: text("memory_id")
      .notNull()
      .references(() => arronMemories.id, { onDelete: "cascade" }),
    role: text().notNull(),
    content: text().notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [index("arron_messages_memory_idx").on(t.memoryId, t.id)],
);

// ==============================================================
// 🌌 SURVIVOR SOCIAL PLATFORM
// Accounts come from Netlify Identity; `users.id` is the Identity
// user id. No real names, no exact locations — country only.
// ==============================================================

export const users = pgTable("users", {
  id: text().primaryKey(),
  email: text().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  lastSeenAt: timestamp("last_seen_at").defaultNow().notNull(),
});

export const profiles = pgTable(
  "profiles",
  {
    userId: text("user_id")
      .primaryKey()
      .references(() => users.id, { onDelete: "cascade" }),
    username: text().notNull(),
    displayName: text("display_name").notNull(),
    avatar: text().notNull().default("🌌"),
    bio: text().notNull().default(""),
    country: text().notNull().default(""),
    mood: text().notNull().default("rising"),
    interests: text().array().notNull().default(sql`'{}'::text[]`),
    story: text().notNull().default(""),
    isPrivate: boolean("is_private").notNull().default(false),
    // v3.1 Sanity Profile
    pronouns: text().notNull().default(""),
    // Who can open /@username: public (anyone, even guests) | members (signed-in only)
    pageVisibility: text("page_visibility").notNull().default("public"),
    // Default audience for new posts: public | members | friends | private
    defaultVisibility: text("default_visibility").notNull().default("public"),
    truthTagDefault: text("truth_tag_default").notNull().default(""),
    // Daily check-in: "how I'm really doing"
    statusText: text("status_text").notNull().default(""),
    statusMood: text("status_mood").notNull().default(""),
    statusAt: timestamp("status_at"),
    onboarded: boolean().notNull().default(false),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (t) => [uniqueIndex("profiles_username_idx").on(t.username)],
);

export const posts = pgTable(
  "posts",
  {
    id: serial().primaryKey(),
    authorId: text("author_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    kind: text().notNull().default("text"), // text | story | video | image | status | journal | writing
    title: text().notNull().default(""),
    body: text().notNull().default(""),
    videoId: text("video_id"),
    imageKey: text("image_key"),
    tags: text().array().notNull().default(sql`'{}'::text[]`),
    mood: text().notNull().default("rising"), // low | anxious | rising | fierce
    contentWarning: boolean("content_warning").notNull().default(false),
    crisis: boolean().notNull().default(false),
    visibility: text().notNull().default("public"), // public | members | friends | private
    // live | pending (waiting for the Owner's review) | held
    status: text().notNull().default("live"),
    hidden: boolean().notNull().default(false),
    // Truth tag: evidence | experience | philosophy ("" = untagged)
    truthTag: text("truth_tag").notNull().default(""),
    // Guardians and the creator can pin a post to the top of the feed.
    pinned: boolean().notNull().default(false),
    // "X have walked this path" — one count per device per post (deduped on the device).
    views: integer().notNull().default(0),
    // Provenance (netlify/lib/provenance.ts): human | ai | collaborative.
    // Provider and model are only ever set by our own functions.
    origin: text().notNull().default("human"),
    aiProvider: text("ai_provider").notNull().default(""),
    aiModel: text("ai_model").notNull().default(""),
    humanReviewed: boolean("human_reviewed").notNull().default(true),
    aiMemoryAllowed: boolean("ai_memory_allowed").notNull().default(false),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [
    index("posts_created_at_idx").on(t.createdAt),
    index("posts_author_idx").on(t.authorId, t.createdAt),
  ],
);

export const comments = pgTable(
  "comments",
  {
    id: serial().primaryKey(),
    postId: integer("post_id")
      .notNull()
      .references(() => posts.id, { onDelete: "cascade" }),
    authorId: text("author_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    body: text().notNull(),
    crisis: boolean().notNull().default(false),
    hidden: boolean().notNull().default(false),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [index("comments_post_idx").on(t.postId, t.createdAt)],
);

export const likes = pgTable(
  "likes",
  {
    postId: integer("post_id")
      .notNull()
      .references(() => posts.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [primaryKey({ columns: [t.postId, t.userId] })],
);

// One row per pair of people. `status` is pending → accepted (declines delete the row).
export const friends = pgTable(
  "friends",
  {
    id: serial().primaryKey(),
    requesterId: text("requester_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    addresseeId: text("addressee_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    status: text().notNull().default("pending"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (t) => [
    uniqueIndex("friends_pair_idx").on(t.requesterId, t.addresseeId),
    index("friends_status_idx").on(t.status),
    index("friends_addressee_idx").on(t.addresseeId, t.status),
  ],
);

export const reports = pgTable(
  "reports",
  {
    id: serial().primaryKey(),
    reporterId: text("reporter_id").references(() => users.id, { onDelete: "set null" }),
    targetType: text("target_type").notNull(), // user | post | comment
    targetId: text("target_id").notNull(),
    reason: text().notNull(),
    details: text().notNull().default(""),
    status: text().notNull().default("open"), // open | reviewed | actioned
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [index("reports_status_idx").on(t.status, t.createdAt)],
);

export const blocks = pgTable(
  "blocks",
  {
    blockerId: text("blocker_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    blockedId: text("blocked_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [primaryKey({ columns: [t.blockerId, t.blockedId] })],
);

// Safety trail: every social interaction and every moderation decision.
export const activityLog = pgTable(
  "activity_log",
  {
    id: serial().primaryKey(),
    userId: text("user_id"),
    action: text().notNull(),
    targetType: text("target_type"),
    targetId: text("target_id"),
    detail: text().notNull().default(""),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [index("activity_log_created_idx").on(t.createdAt)],
);

// ─── AI STUDIO — humans and AIs creating side by side ───
// kind: "creation" (AI-made post), "battle" (daily Human vs AI entry),
// "podcast" (a multi-AI Unity Pod episode; turns live in `script`).
// authorId is null for AI-made items; `model` records which AI made it.
export const studioItems = pgTable(
  "studio_items",
  {
    id: serial().primaryKey(),
    kind: text().notNull(),
    authorId: text("author_id").references(() => users.id, { onDelete: "cascade" }),
    authorLabel: text("author_label").notNull(),
    model: text(),
    style: text().notNull().default(""),
    topic: text().notNull().default(""),
    title: text().notNull().default(""),
    body: text().notNull().default(""),
    script: jsonb(),
    day: text(),
    hidden: boolean().notNull().default(false),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [index("studio_items_kind_idx").on(t.kind, t.id), index("studio_items_day_idx").on(t.kind, t.day)],
);

// One heart per voter per item. voter is an Identity user id or a random device key.
export const studioVotes = pgTable(
  "studio_votes",
  {
    itemId: integer("item_id")
      .notNull()
      .references(() => studioItems.id, { onDelete: "cascade" }),
    voter: text().notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [primaryKey({ columns: [t.itemId, t.voter] })],
);

// Daily AI usage per visitor (hashed IP or user id) so costs stay predictable.
export const studioUsage = pgTable(
  "studio_usage",
  {
    key: text().primaryKey(),
    count: integer().notNull().default(0),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
);

// ─── AI STORIES — the best moments people have shared with Arron ───
// kind: inspiring | funny | wisdom | win. Members share; everyone reads.
// Every story passes moderation before it is saved.
export const aiStories = pgTable(
  "ai_stories",
  {
    id: serial().primaryKey(),
    authorId: text("author_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    kind: text().notNull().default("inspiring"),
    title: text().notNull().default(""),
    userLine: text("user_line").notNull().default(""),
    arronLine: text("arron_line").notNull(),
    reflection: text().notNull().default(""),
    anonymous: boolean().notNull().default(false),
    contentWarning: boolean("content_warning").notNull().default(false),
    hidden: boolean().notNull().default(false),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [index("ai_stories_created_idx").on(t.hidden, t.id), index("ai_stories_kind_idx").on(t.kind, t.id)],
);

// One heart per voter per story. voter is "u:<identity id>" or "d:<device key>".
export const aiStoryHearts = pgTable(
  "ai_story_hearts",
  {
    storyId: integer("story_id")
      .notNull()
      .references(() => aiStories.id, { onDelete: "cascade" }),
    voter: text().notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [primaryKey({ columns: [t.storyId, t.voter] })],
);

// ==============================================================
// ✨ v3.0 THE SANCTUARY
// ==============================================================

// "My Sanctuary" — a private collection of posts that matter to someone.
export const saves = pgTable(
  "saves",
  {
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    postId: integer("post_id")
      .notNull()
      .references(() => posts.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.postId] }), index("saves_user_idx").on(t.userId, t.createdAt)],
);

// Images Arron creates with members. The file lives in the "post-images"
// blob store under `imageKey`; `shared` puts it in the public gallery.
export const creations = pgTable(
  "creations",
  {
    id: serial().primaryKey(),
    authorId: text("author_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    prompt: text().notNull(),
    title: text().notNull().default(""),
    imageKey: text("image_key").notNull(),
    model: text().notNull().default(""),
    shared: boolean().notNull().default(false),
    hidden: boolean().notNull().default(false),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [index("creations_author_idx").on(t.authorId, t.id), index("creations_gallery_idx").on(t.shared, t.hidden, t.id)],
);

// Writing for the site, drafted with Arron. kind: wisdom | story | educational | poetry | update.
// status: pending → published (or rejected). The creator's own pieces publish instantly.
export const siteContent = pgTable(
  "site_content",
  {
    id: serial().primaryKey(),
    authorId: text("author_id").references(() => users.id, { onDelete: "set null" }),
    credit: text().notNull(),
    kind: text().notNull(),
    title: text().notNull().default(""),
    body: text().notNull(),
    truthTag: text("truth_tag").notNull().default("experience"),
    anonymous: boolean().notNull().default(false),
    status: text().notNull().default("pending"),
    reviewNote: text("review_note").notNull().default(""),
    origin: text().notNull().default("human"),
    aiProvider: text("ai_provider").notNull().default(""),
    aiModel: text("ai_model").notNull().default(""),
    humanReviewed: boolean("human_reviewed").notNull().default(true),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    publishedAt: timestamp("published_at"),
  },
  (t) => [index("site_content_status_idx").on(t.status, t.kind, t.id)],
);

// Private game progress — one JSON blob per member per game, so it follows them across devices.
export const gameProgress = pgTable(
  "game_progress",
  {
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    game: text().notNull(),
    data: jsonb().notNull().default({}),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.game] })],
);

// ==============================================================
// 💫 v3.1 — OWNER & COMMUNITY
// ==============================================================

// Roles the Owner grants by hand: guardian | creator. The Owner role itself
// is never stored — it comes from Shane's verified email and can't be granted or removed.
export const memberRoles = pgTable(
  "member_roles",
  {
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    role: text().notNull(),
    grantedBy: text("granted_by"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.role] })],
);

// A member's own journal — private first. Sharing creates a feed post (postId).
export const journalEntries = pgTable(
  "journal_entries",
  {
    id: serial().primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    title: text().notNull().default(""),
    body: text().notNull(),
    mood: text().notNull().default(""),
    truthTag: text("truth_tag").notNull().default(""),
    // private (only me) | members | public — shown on their /@username page when not private
    visibility: text().notNull().default("private"),
    source: text().notNull().default("self"), // self | arron
    postId: integer("post_id").references(() => posts.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (t) => [index("journal_entries_user_idx").on(t.userId, t.id)],
);

// Owner-controlled switches: review mode for member posts, Arron voice notes.
export const siteSettings = pgTable("site_settings", {
  key: text().primaryKey(),
  value: jsonb().notNull().default({}),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Per-minute request counters for the rate limiter (netlify/lib/rate-limit.ts).
// The key is "bucket:who" where who is a member id or a hashed IP — never a raw address.
export const rateLimits = pgTable("rate_limits", {
  key: text().primaryKey(),
  windowStart: integer("window_start").notNull(),
  count: integer().notNull().default(0),
});

// Arron's Workbench — changes Arron drafts for Shane from chat.
// kind: page (a code/page change, handed to the builder as a ready brief)
//     | feed | wisdom (content that goes live in one click on approval).
// status: proposed → approved (ready to push) → done | dismissed.
// Nothing here changes the site until Shane approves it.
export const siteProposals = pgTable(
  "site_proposals",
  {
    id: serial().primaryKey(),
    kind: text().notNull().default("page"),
    target: text().notNull().default(""), // e.g. "index.html", "feed", "games.html"
    title: text().notNull(),
    why: text().notNull().default(""),
    body: text().notNull(), // the draft: ready-to-paste words or a precise build brief
    status: text().notNull().default("proposed"),
    liveHref: text("live_href").notNull().default(""),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (t) => [index("site_proposals_status_idx").on(t.status, t.id)],
);

// Sanity Passport — a voluntary "who I am" layer. Not a medical record.
// fields: { [key]: { text, visibility: private|members|public, ai: boolean } }
// Every field starts private and hidden from Arron. aiMemoryAllowed and
// personalise are the member's master switches over the per-field ticks.
export const passports = pgTable("passports", {
  userId: text("user_id")
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
  fields: jsonb().notNull().default({}),
  aiMemoryAllowed: boolean("ai_memory_allowed").notNull().default(false),
  personalise: boolean().notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
