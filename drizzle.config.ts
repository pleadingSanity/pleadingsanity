// Plain config object — no runtime import of drizzle-kit, so the config
// loads even when drizzle-kit is run from the npx cache.
export default {
  dialect: "postgresql",
  schema: "./db/schema.ts",
  out: "netlify/database/migrations",
};
