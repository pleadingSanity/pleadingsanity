import type { Config, Context } from "@netlify/edge-functions";

// Emergency contacts live on /crisis.html. Arron surfaces support in context,
// and only presents emergency options when the conversation calls for them.
export default async (_req: Request, context: Context) => context.next();

export const config: Config = {
  path: ["/arron-app.html", "/arron-app"],
};
