import { pgTable, serial, text, timestamp, index } from "drizzle-orm/pg-core";

// One row per Arron memory. The id is a random secret generated on the
// visitor's device — no names, emails or accounts are ever required.
export const arronMemories = pgTable("arron_memories", {
  id: text().primaryKey(),
  story: text().notNull().default(""),
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
