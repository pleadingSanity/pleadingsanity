import { drizzle } from "drizzle-orm/node-postgres";
import { getDatabase } from "@netlify/database";
import * as schema from "./schema.js";

// Netlify Database hands us a ready-made, pg-compatible connection pool.
// We query through Drizzle's node-postgres driver on that pool: the
// installed drizzle "netlify-db" HTTP driver calls the Neon client in a
// way it no longer accepts, which made every Arron query fail.
export const db = drizzle({ client: getDatabase().pool, schema });
