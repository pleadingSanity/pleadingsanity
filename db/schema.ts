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
    kind: text().notNull().default("text"), // text | story | video | image
    title: text().notNull().default(""),
    body: text().notNull().default(""),
    videoId: text("video_id"),
    imageKey: text("image_key"),
    tags: text().array().notNull().default(sql`'{}'::text[]`),
    mood: text().notNull().default("rising"), // low | anxious | rising | fierce
    contentWarning: boolean("content_warning").notNull().default(false),
    crisis: boolean().notNull().default(false),
    visibility: text().notNull().default("public"), // public | friends
    hidden: boolean().notNull().default(false),
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
