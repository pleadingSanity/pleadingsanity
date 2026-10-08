// ==============================================================
// ✍️ POSTS — feed, create, likes and comments
//   GET    /api/posts?filter=all|friends|mine|saved|uplifting&tag=&author=&before=
//   GET    /api/posts?public=1            guests: public, live posts only
//   POST   /api/posts                     create (moderated)
//   GET    /api/posts/:id                 single post + comments
//   DELETE /api/posts/:id                 own post
//   POST   /api/posts/:id/like            toggle heart
//   POST   /api/posts/views  {ids:[]}     "X have walked this path" (anyone; deduped on the device)
//   POST   /api/posts/:id/comments        add comment (kind only)
//   POST   /api/posts/:id/save            toggle "My Sanctuary" save
//   POST   /api/posts/:id/pin             toggle pin (Guardians + creator)
//   DELETE /api/comments/:id              own comment, or on own post
// The feed is chronological, newest first. No ranking, ever.
// Hearts are positive-only (no downvotes, ever). Raw heart counts are shown
// only to the author; everyone else sees the milestone glow (10/50/100/500/1000).
// Audiences: public · members · friends · private (only me).
// status: live, or pending/held while the Owner reviews (review mode).
// ==============================================================

import type { Config, Context } from "@netlify/functions";
import { getStore } from "@netlify/blobs";
import { and, arrayContains, asc, desc, eq, inArray, lt, ne, notInArray, or, sql, type SQL } from "drizzle-orm";
import { db } from "../../db/index.js";
import { comments, likes, posts, profiles, saves } from "../../db/schema.js";
import {
  areFriends,
  badgesFor,
  blockedIds,
  cleanTags,
  countSql,
  currentUser,
  friendIds,
  isBlockedEitherWay,
  isGuardian,
  isOwner,
  json,
  logActivity,
  moderate,
  profileFor,
  readBody,
  str,
  unauthorized,
} from "../lib/social.js";
import { publishPost, type Post } from "../lib/publish.js";
import { allow, slowDown } from "../lib/rate-limit.js";
import { provenanceOut } from "../lib/provenance.js";

const PAGE = 15;
// Heart milestones — Arron's words for each live in the soul file (arron-knowledge.json → feedMilestones).
const MILESTONES = [1000, 500, 100, 50, 10];
const milestoneFor = (hearts: number) => MILESTONES.find((m) => hearts >= m) ?? 0;
const UPLIFTING_MOODS = ["rising", "fierce"];

type Viewer = { id: string; roles: string[] };

// Which posts a signed-in member may see: their own (any state), plus live
// posts for public/members, and live friends-only posts from their circle.
function visibleTo(viewerId: string, circle: string[]): SQL {
  return or(
    eq(posts.authorId, viewerId),
    and(
      eq(posts.status, "live"),
      or(
        inArray(posts.visibility, ["public", "members"]),
        and(eq(posts.visibility, "friends"), inArray(posts.authorId, circle.length ? circle : ["-"])),
      ),
    ),
  ) as SQL;
}

async function canView(post: Post, viewer: Viewer) {
  if (post.authorId === viewer.id) return true;
  if (post.hidden) return isGuardian(viewer.roles);
  if (post.status !== "live") return isOwner(viewer.roles) || isGuardian(viewer.roles);
  if (post.visibility === "private") return false;
  if (await isBlockedEitherWay(viewer.id, post.authorId)) return false;
  if (post.visibility === "public" || post.visibility === "members") return true;
  return areFriends(viewer.id, post.authorId);
}

// Attach author cards, like counts and comment counts to a set of posts.
async function hydrate(rows: Post[], viewerId: string) {
  if (!rows.length) return [];
  const ids = rows.map((p) => p.id);
  const authorIds = [...new Set(rows.map((p) => p.authorId))];
  // Hearts are never ranked or shown as public numbers — no popularity contests.
  // Only hearts from others count towards a milestone.
  const [authors, mine, commentCounts, saved, badges, heartCounts] = await Promise.all([
    db.select().from(profiles).where(inArray(profiles.userId, authorIds)),
    viewerId
      ? db.select({ postId: likes.postId }).from(likes).where(and(inArray(likes.postId, ids), eq(likes.userId, viewerId)))
      : Promise.resolve([] as { postId: number }[]),
    db
      .select({ postId: comments.postId, n: countSql })
      .from(comments)
      .where(and(inArray(comments.postId, ids), eq(comments.hidden, false)))
      .groupBy(comments.postId),
    viewerId
      ? db.select({ postId: saves.postId }).from(saves).where(and(inArray(saves.postId, ids), eq(saves.userId, viewerId)))
      : Promise.resolve([] as { postId: number }[]),
    badgesFor(authorIds),
    db
      .select({ postId: likes.postId, n: countSql })
      .from(likes)
      .innerJoin(posts, eq(posts.id, likes.postId))
      .where(and(inArray(likes.postId, ids), ne(likes.userId, posts.authorId)))
      .groupBy(likes.postId),
  ]);
  const heartMap = new Map(heartCounts.map((h) => [h.postId, h.n]));
  const savedSet = new Set(saved.map((s) => s.postId));
  const authorMap = new Map(authors.map((a) => [a.userId, a]));
  const likedSet = new Set(mine.map((l) => l.postId));
  const commentMap = new Map(commentCounts.map((c) => [c.postId, c.n]));

  return rows.map((p) => {
    const a = authorMap.get(p.authorId);
    return {
      id: p.id,
      kind: p.kind,
      title: p.title,
      body: p.body,
      videoId: p.videoId,
      imageUrl: p.imageKey ? `/api/images/${p.imageKey}` : null,
      tags: p.tags,
      mood: p.mood,
      contentWarning: p.contentWarning,
      crisis: p.crisis,
      visibility: p.visibility,
      status: p.status,
      truthTag: p.truthTag,
      ...provenanceOut(p),
      pinned: p.pinned,
      createdAt: p.createdAt,
      author: a
        ? { username: a.username, displayName: a.displayName, avatar: a.avatar, mood: a.mood, badge: badges.get(p.authorId) ?? "" }
        : { username: "", displayName: "Survivor", avatar: "🌌", mood: "rising", badge: "" },
      liked: likedSet.has(p.id),
      saved: savedSet.has(p.id),
      comments: commentMap.get(p.id) ?? 0,
      views: p.views ?? 0,
      milestone: milestoneFor(heartMap.get(p.id) ?? 0),
      hearts: p.authorId === viewerId ? heartMap.get(p.id) ?? 0 : undefined,
      mine: p.authorId === viewerId,
    };
  });
}

async function feed(viewer: Viewer, url: URL) {
  const filter = url.searchParams.get("filter") ?? "all";
  const tag = cleanTags([url.searchParams.get("tag") ?? ""])[0];
  const authorName = url.searchParams.get("author");
  const before = Number(url.searchParams.get("before"));

  const [blocked, friendList] = await Promise.all([blockedIds(viewer.id), friendIds(viewer.id)]);
  const savedIds =
    filter === "saved"
      ? (await db.select({ postId: saves.postId }).from(saves).where(eq(saves.userId, viewer.id))).map((r) => r.postId)
      : [];
  const circle = [viewer.id, ...friendList];

  let authorId: string | undefined;
  if (authorName) {
    const [a] = await db.select({ id: profiles.userId }).from(profiles).where(eq(profiles.username, authorName.toLowerCase()));
    if (!a) return json({ posts: [], nextBefore: null });
    authorId = a.id;
  }

  const rows = await db
    .select()
    .from(posts)
    .where(
      and(
        eq(posts.hidden, false),
        blocked.length ? notInArray(posts.authorId, blocked) : undefined,
        visibleTo(viewer.id, circle),
        // On someone's page, their private and pending posts stay theirs.
        authorId && authorId !== viewer.id ? eq(posts.status, "live") : undefined,
        filter === "friends" ? inArray(posts.authorId, friendList.length ? friendList : ["-"]) : undefined,
        filter === "uplifting"
          ? and(inArray(posts.mood, UPLIFTING_MOODS), eq(posts.crisis, false), eq(posts.contentWarning, false))
          : undefined,
        filter === "mine" ? eq(posts.authorId, viewer.id) : undefined,
        filter === "saved" ? inArray(posts.id, savedIds.length ? savedIds : [-1]) : undefined,
        authorId ? eq(posts.authorId, authorId) : undefined,
        tag ? arrayContains(posts.tags, [tag]) : undefined,
        Number.isInteger(before) && before > 0 ? lt(posts.id, before) : undefined,
      ),
    )
    .orderBy(desc(posts.createdAt), desc(posts.id))
    .limit(PAGE + 1);

  const page = rows.slice(0, PAGE);

  // Pinned posts sit above the first page of the main feed — chosen by Guardians, never by an algorithm.
  let pinned: Post[] = [];
  if (filter === "all" && !tag && !authorId && !(before > 0)) {
    pinned = await db
      .select()
      .from(posts)
      .where(
        and(
          eq(posts.pinned, true),
          eq(posts.hidden, false),
          eq(posts.status, "live"),
          inArray(posts.visibility, ["public", "members"]),
          blocked.length ? notInArray(posts.authorId, blocked) : undefined,
        ),
      )
      .orderBy(desc(posts.createdAt))
      .limit(3);
  }

  return json({
    posts: await hydrate(page, viewer.id),
    pinned: await hydrate(pinned, viewer.id),
    nextBefore: rows.length > PAGE ? page[page.length - 1].id : null,
  });
}

// Guests (home page "For You" stream, the feed, /@username pages) see public,
// live, non-crisis posts only.
async function publicFeed(url: URL) {
  const before = Number(url.searchParams.get("before"));
  const filter = url.searchParams.get("filter");
  const authorName = url.searchParams.get("author");
  let authorId: string | undefined;
  if (authorName) {
    const [a] = await db
      .select({ id: profiles.userId, isPrivate: profiles.isPrivate, page: profiles.pageVisibility })
      .from(profiles)
      .where(eq(profiles.username, authorName.toLowerCase()));
    if (!a || a.isPrivate || a.page !== "public") return json({ posts: [], nextBefore: null, guest: true });
    authorId = a.id;
  }
  const rows = await db
    .select()
    .from(posts)
    .where(
      and(
        eq(posts.hidden, false),
        eq(posts.visibility, "public"),
        eq(posts.status, "live"),
        eq(posts.crisis, false),
        authorId ? eq(posts.authorId, authorId) : undefined,
        filter === "uplifting" ? and(inArray(posts.mood, UPLIFTING_MOODS), eq(posts.contentWarning, false)) : undefined,
        Number.isInteger(before) && before > 0 ? lt(posts.id, before) : undefined,
      ),
    )
    .orderBy(desc(posts.createdAt), desc(posts.id))
    .limit(PAGE + 1);
  const page = rows.slice(0, PAGE);
  return json({
    posts: await hydrate(page, ""),
    nextBefore: rows.length > PAGE ? page[page.length - 1].id : null,
    guest: true,
  });
}

async function createPost(req: Request, viewer: Viewer) {
  const result = await publishPost(viewer, await readBody(req));
  if (!result.ok) {
    const { ok: _ok, status, ...body } = result;
    return json(body, status);
  }
  const [hydrated] = await hydrate([result.post], viewer.id);
  return json({ post: hydrated, pending: result.pending, crisis: result.crisis, support: result.support }, 201);
}

async function loadPost(id: number) {
  if (!Number.isInteger(id)) return null;
  const [post] = await db.select().from(posts).where(eq(posts.id, id));
  return post ?? null;
}

async function listComments(postId: number, viewerId: string) {
  const blocked = await blockedIds(viewerId);
  const rows = await db
    .select({ comment: comments, author: profiles })
    .from(comments)
    .leftJoin(profiles, eq(profiles.userId, comments.authorId))
    .where(
      and(
        eq(comments.postId, postId),
        eq(comments.hidden, false),
        blocked.length ? notInArray(comments.authorId, blocked) : undefined,
      ),
    )
    .orderBy(asc(comments.createdAt))
    .limit(200);
  return rows.map(({ comment, author }) => ({
    id: comment.id,
    body: comment.body,
    crisis: comment.crisis,
    createdAt: comment.createdAt,
    mine: comment.authorId === viewerId,
    author: author
      ? { username: author.username, displayName: author.displayName, avatar: author.avatar }
      : { username: "", displayName: "Survivor", avatar: "🌌" },
  }));
}

async function getPost(post: Post, viewer: Viewer) {
  const [hydrated] = await hydrate([post], viewer.id);
  return json({ post: hydrated, comments: await listComments(post.id, viewer.id) });
}

async function deletePost(post: Post, viewer: Viewer) {
  if (post.authorId !== viewer.id && !isGuardian(viewer.roles)) return json({ error: "Not your post." }, 403);
  if (post.imageKey) await getStore("post-images").delete(post.imageKey).catch(() => {});
  await db.delete(posts).where(eq(posts.id, post.id));
  await logActivity(viewer.id, "post.delete", "post", post.id);
  return json({ ok: true });
}

async function toggleLike(post: Post, viewer: Viewer) {
  const removed = await db
    .delete(likes)
    .where(and(eq(likes.postId, post.id), eq(likes.userId, viewer.id)))
    .returning({ postId: likes.postId });
  if (!removed.length) {
    await db.insert(likes).values({ postId: post.id, userId: viewer.id }).onConflictDoNothing();
    await logActivity(viewer.id, "post.like", "post", post.id);
  }
  return json({ liked: !removed.length });
}

async function toggleSave(post: Post, viewer: Viewer) {
  const removed = await db
    .delete(saves)
    .where(and(eq(saves.postId, post.id), eq(saves.userId, viewer.id)))
    .returning({ postId: saves.postId });
  if (!removed.length) await db.insert(saves).values({ postId: post.id, userId: viewer.id }).onConflictDoNothing();
  return json({ saved: !removed.length });
}

async function togglePin(post: Post, viewer: Viewer) {
  if (!isGuardian(viewer.roles)) return json({ error: "Only Guardians can pin posts." }, 403);
  if (post.visibility !== "public" || post.status !== "live") return json({ error: "Only live, public posts can be pinned." }, 400);
  // Up to three pins at a time, so the top of the feed stays calm.
  if (!post.pinned) {
    const [row] = await db.select({ n: countSql }).from(posts).where(and(eq(posts.pinned, true), ne(posts.id, post.id)));
    if ((row?.n ?? 0) >= 3) return json({ error: "Three posts are already pinned — unpin one first." }, 409);
  }
  const [row] = await db.update(posts).set({ pinned: !post.pinned }).where(eq(posts.id, post.id)).returning({ pinned: posts.pinned });
  await logActivity(viewer.id, row.pinned ? "post.pin" : "post.unpin", "post", post.id);
  return json({ pinned: row.pinned });
}

async function addComment(req: Request, post: Post, viewer: Viewer) {
  const profile = await profileFor(viewer.id);
  if (!profile?.onboarded) return json({ error: "Finish setting up your profile first.", onboarding: true }, 409);
  const body = await readBody(req);
  const text = str(body.body, 1000);
  if (!text) return json({ error: "Your comment is empty." }, 400);

  const verdict = await moderate(text, "comment");
  if (!verdict.allowed) {
    await logActivity(viewer.id, "comment.blocked", "post", post.id, verdict.reason);
    return json(
      {
        error: "Comments here need to be kind and supportive.",
        reason: verdict.reason || "Try rewording it the way you'd want someone to speak to you.",
        blocked: true,
      },
      422,
    );
  }

  const [comment] = await db
    .insert(comments)
    .values({ postId: post.id, authorId: viewer.id, body: text, crisis: verdict.crisis })
    .returning();
  await logActivity(viewer.id, "comment.create", "comment", comment.id);
  return json(
    {
      comment: {
        id: comment.id,
        body: comment.body,
        crisis: comment.crisis,
        createdAt: comment.createdAt,
        mine: true,
        author: { username: profile.username, displayName: profile.displayName, avatar: profile.avatar },
      },
    },
    201,
  );
}

async function deleteComment(id: number, viewer: Viewer) {
  const [comment] = Number.isInteger(id) ? await db.select().from(comments).where(eq(comments.id, id)) : [];
  if (!comment) return json({ error: "Comment not found." }, 404);
  const post = await loadPost(comment.postId);
  const allowed = comment.authorId === viewer.id || post?.authorId === viewer.id || isGuardian(viewer.roles);
  if (!allowed) return json({ error: "Not your comment." }, 403);
  await db.delete(comments).where(eq(comments.id, id));
  await logActivity(viewer.id, "comment.delete", "comment", id);
  return json({ ok: true });
}

// "X have walked this path": the device sends each post id once, ever.
// Only live, visible public/members posts count; own views are skipped.
async function countViews(req: Request, context: Context, userId: string | null) {
  if (!(await allow("views", context, userId))) return json({ ok: true, counted: 0 });
  const body = await readBody(req);
  const ids = [...new Set((Array.isArray(body.ids) ? body.ids : []).map(Number).filter((n) => Number.isInteger(n) && n > 0))].slice(0, 30);
  if (!ids.length) return json({ ok: true, counted: 0 });
  const conditions = [
    inArray(posts.id, ids),
    eq(posts.status, "live"),
    eq(posts.hidden, false),
    inArray(posts.visibility, userId ? ["public", "members"] : ["public"]),
  ];
  if (userId) conditions.push(ne(posts.authorId, userId));
  const rows = await db
    .update(posts)
    .set({ views: sql`${posts.views} + 1` })
    .where(and(...conditions))
    .returning({ id: posts.id });
  return json({ ok: true, counted: rows.length });
}

export default async (req: Request, context: Context) => {
  try {
    const user = await currentUser();
    const url = new URL(req.url);
    const parts = url.pathname.split("/").filter(Boolean); // ["api", "posts", id?, sub?]
    if (parts[1] === "posts" && parts[2] === "views" && parts.length === 3) {
      return req.method === "POST" ? await countViews(req, context, user?.id ?? null) : json({ error: "Method not allowed" }, 405);
    }
    if (!user && parts.length === 2 && parts[1] === "posts" && req.method === "GET" && url.searchParams.get("public") === "1") {
      return await publicFeed(url);
    }
    // Shared links open for guests too, when the post is public and live.
    if (!user && parts[1] === "posts" && parts.length >= 3 && req.method === "GET") {
      const post = await loadPost(Number(parts[2]));
      if (!post || post.hidden || post.status !== "live" || post.visibility !== "public") return unauthorized();
      const [hydrated] = await hydrate([post], "");
      const list = await listComments(post.id, "");
      if (parts[3] === "comments") return json({ comments: list });
      if (!parts[3]) return json({ post: hydrated, comments: list, guest: true });
      return unauthorized();
    }
    if (!user) return unauthorized();
    const viewer: Viewer = { id: user.id, roles: user.roles };

    if (parts[1] === "comments") {
      if (req.method === "DELETE") return await deleteComment(Number(parts[2]), viewer);
      return json({ error: "Method not allowed" }, 405);
    }

    if (parts.length === 2) {
      if (req.method === "GET") return await feed(viewer, url);
      if (req.method === "POST") {
        if (!(await allow("write", undefined, user.id))) return slowDown();
        return await createPost(req, viewer);
      }
      return json({ error: "Method not allowed" }, 405);
    }

    const post = await loadPost(Number(parts[2]));
    if (!post || !(await canView(post, viewer))) return json({ error: "Post not found." }, 404);
    const sub = parts[3];

    if (!sub && req.method === "GET") return await getPost(post, viewer);
    if (!sub && req.method === "DELETE") return await deletePost(post, viewer);
    if (sub === "like" && req.method === "POST") return await toggleLike(post, viewer);
    if (sub === "save" && req.method === "POST") return await toggleSave(post, viewer);
    if (sub === "pin" && req.method === "POST") return await togglePin(post, viewer);
    if (sub === "comments" && req.method === "GET") return json({ comments: await listComments(post.id, viewer.id) });
    if (sub === "comments" && req.method === "POST") {
      if (!(await allow("write", undefined, user.id))) return slowDown();
      return await addComment(req, post, viewer);
    }
    return json({ error: "Not found" }, 404);
  } catch (error) {
    console.error("Posts API error:", (error as Error)?.name || "error");
    return json({ error: "Something went wrong. Please try again." }, 500);
  }
};

export const config: Config = {
  path: ["/api/posts", "/api/posts/:id", "/api/posts/:id/:action", "/api/comments/:id"],
};
