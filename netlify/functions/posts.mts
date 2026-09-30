// ==============================================================
// ✍️ POSTS — feed, create, likes and comments
//   GET    /api/posts?filter=all|friends|mine&tag=&author=&before=
//   POST   /api/posts                     create (moderated)
//   GET    /api/posts/:id                 single post + comments
//   DELETE /api/posts/:id                 own post
//   POST   /api/posts/:id/like            toggle heart
//   POST   /api/posts/:id/comments        add comment (kind only)
//   DELETE /api/comments/:id              own comment, or on own post
// ==============================================================

import type { Config } from "@netlify/functions";
import { getStore } from "@netlify/blobs";
import { and, arrayContains, asc, desc, eq, inArray, lt, notInArray, or } from "drizzle-orm";
import { db } from "../../db/index.js";
import { comments, likes, posts, profiles } from "../../db/schema.js";
import {
  areFriends,
  blockedIds,
  cleanMood,
  cleanTags,
  countSql,
  CRISIS_SUPPORT,
  currentUser,
  friendIds,
  isBlockedEitherWay,
  json,
  logActivity,
  moderate,
  profileFor,
  readBody,
  str,
  unauthorized,
} from "../lib/social.js";

const PAGE = 15;
const KINDS = ["text", "story", "video", "image"] as const;
const YOUTUBE_ID = /^[A-Za-z0-9_-]{11}$/;

type Post = typeof posts.$inferSelect;
type Viewer = { id: string; roles: string[] };

function youtubeId(input: string): string | null {
  const value = input.trim();
  if (YOUTUBE_ID.test(value)) return value;
  try {
    const url = new URL(value);
    const host = url.hostname.replace(/^www\.|^m\./, "");
    let id: string | null = null;
    if (host === "youtu.be") id = url.pathname.slice(1);
    else if (host === "youtube.com" || host === "youtube-nocookie.com") {
      id = url.searchParams.get("v");
      const parts = url.pathname.split("/").filter(Boolean);
      if (!id && ["embed", "shorts", "live", "v"].includes(parts[0])) id = parts[1] ?? null;
    }
    return id && YOUTUBE_ID.test(id) ? id : null;
  } catch {
    return null;
  }
}

async function canView(post: Post, viewer: Viewer) {
  if (post.authorId === viewer.id) return true;
  if (post.hidden) return viewer.roles.includes("admin");
  if (await isBlockedEitherWay(viewer.id, post.authorId)) return false;
  if (post.visibility === "public") return true;
  return areFriends(viewer.id, post.authorId);
}

// Attach author cards, like counts and comment counts to a set of posts.
async function hydrate(rows: Post[], viewerId: string) {
  if (!rows.length) return [];
  const ids = rows.map((p) => p.id);
  const authorIds = [...new Set(rows.map((p) => p.authorId))];
  const [authors, likeCounts, mine, commentCounts] = await Promise.all([
    db.select().from(profiles).where(inArray(profiles.userId, authorIds)),
    db.select({ postId: likes.postId, n: countSql }).from(likes).where(inArray(likes.postId, ids)).groupBy(likes.postId),
    db.select({ postId: likes.postId }).from(likes).where(and(inArray(likes.postId, ids), eq(likes.userId, viewerId))),
    db
      .select({ postId: comments.postId, n: countSql })
      .from(comments)
      .where(and(inArray(comments.postId, ids), eq(comments.hidden, false)))
      .groupBy(comments.postId),
  ]);
  const authorMap = new Map(authors.map((a) => [a.userId, a]));
  const likeMap = new Map(likeCounts.map((l) => [l.postId, l.n]));
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
      createdAt: p.createdAt,
      author: a
        ? { username: a.username, displayName: a.displayName, avatar: a.avatar }
        : { username: "", displayName: "Survivor", avatar: "🌌" },
      likes: likeMap.get(p.id) ?? 0,
      liked: likedSet.has(p.id),
      comments: commentMap.get(p.id) ?? 0,
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
        or(eq(posts.visibility, "public"), inArray(posts.authorId, circle)),
        filter === "friends" ? inArray(posts.authorId, friendList.length ? friendList : ["-"]) : undefined,
        filter === "mine" ? eq(posts.authorId, viewer.id) : undefined,
        authorId ? eq(posts.authorId, authorId) : undefined,
        tag ? arrayContains(posts.tags, [tag]) : undefined,
        Number.isInteger(before) && before > 0 ? lt(posts.id, before) : undefined,
      ),
    )
    .orderBy(desc(posts.createdAt), desc(posts.id))
    .limit(PAGE + 1);

  const page = rows.slice(0, PAGE);
  return json({
    posts: await hydrate(page, viewer.id),
    nextBefore: rows.length > PAGE ? page[page.length - 1].id : null,
  });
}

// Guests (home page "For You" stream) see public, visible, non-crisis posts only.
async function publicFeed(url: URL) {
  const before = Number(url.searchParams.get("before"));
  const rows = await db
    .select()
    .from(posts)
    .where(
      and(
        eq(posts.hidden, false),
        eq(posts.visibility, "public"),
        eq(posts.crisis, false),
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
  const profile = await profileFor(viewer.id);
  if (!profile?.onboarded) return json({ error: "Finish setting up your profile first.", onboarding: true }, 409);

  const body = await readBody(req);
  const kind = (KINDS as readonly string[]).includes(body.kind as string) ? (body.kind as Post["kind"]) : "text";
  const title = str(body.title, 120);
  const text = str(body.body, kind === "story" ? 20000 : 5000);

  let videoId: string | null = null;
  if (kind === "video") {
    videoId = youtubeId(str(body.videoUrl, 300));
    if (!videoId) return json({ error: "That doesn't look like a YouTube link. Try copying it again." }, 400);
  }

  let imageKey: string | null = null;
  if (kind === "image") {
    const key = str(body.imageKey, 200);
    if (!key.startsWith(`${viewer.id}/`)) return json({ error: "Please upload an image first." }, 400);
    const exists = await getStore("post-images").getMetadata(key);
    if (!exists) return json({ error: "That image upload has expired — please add it again." }, 400);
    imageKey = key;
  }

  if (!title && !text && !videoId && !imageKey) return json({ error: "Your post is empty." }, 400);

  const verdict = await moderate(`${title}\n\n${text}`, "post");
  if (!verdict.allowed) {
    await logActivity(viewer.id, "post.blocked", "post", undefined, verdict.reason);
    return json(
      {
        error: "This post can't be shared as it is.",
        reason: verdict.reason || "It may be hurtful to others. Try rewording it with kindness.",
        blocked: true,
      },
      422,
    );
  }

  const visibility = body.visibility === "friends" ? "friends" : body.visibility === "public" ? "public" : profile.isPrivate ? "friends" : "public";
  const [post] = await db
    .insert(posts)
    .values({
      authorId: viewer.id,
      kind,
      title,
      body: text,
      videoId,
      imageKey,
      tags: cleanTags(body.tags),
      mood: cleanMood(body.mood),
      contentWarning: verdict.contentWarning || body.contentWarning === true,
      crisis: verdict.crisis,
      visibility,
    })
    .returning();
  await logActivity(viewer.id, "post.create", "post", post.id, verdict.crisis ? "crisis-strip" : "");

  const [hydrated] = await hydrate([post], viewer.id);
  return json({ post: hydrated, crisis: verdict.crisis, support: verdict.crisis ? CRISIS_SUPPORT : null }, 201);
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
  if (post.authorId !== viewer.id && !viewer.roles.includes("admin")) return json({ error: "Not your post." }, 403);
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
  const [row] = await db.select({ n: countSql }).from(likes).where(eq(likes.postId, post.id));
  return json({ liked: !removed.length, likes: row?.n ?? 0 });
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
  const allowed = comment.authorId === viewer.id || post?.authorId === viewer.id || viewer.roles.includes("admin");
  if (!allowed) return json({ error: "Not your comment." }, 403);
  await db.delete(comments).where(eq(comments.id, id));
  await logActivity(viewer.id, "comment.delete", "comment", id);
  return json({ ok: true });
}

export default async (req: Request) => {
  try {
    const user = await currentUser();
    const url = new URL(req.url);
    const parts = url.pathname.split("/").filter(Boolean); // ["api", "posts", id?, sub?]
    if (!user && parts.length === 2 && parts[1] === "posts" && req.method === "GET" && url.searchParams.get("public") === "1") {
      return await publicFeed(url);
    }
    if (!user) return unauthorized();
    const viewer: Viewer = { id: user.id, roles: user.roles };

    if (parts[1] === "comments") {
      if (req.method === "DELETE") return await deleteComment(Number(parts[2]), viewer);
      return json({ error: "Method not allowed" }, 405);
    }

    if (parts.length === 2) {
      if (req.method === "GET") return await feed(viewer, url);
      if (req.method === "POST") return await createPost(req, viewer);
      return json({ error: "Method not allowed" }, 405);
    }

    const post = await loadPost(Number(parts[2]));
    if (!post || !(await canView(post, viewer))) return json({ error: "Post not found." }, 404);
    const sub = parts[3];

    if (!sub && req.method === "GET") return await getPost(post, viewer);
    if (!sub && req.method === "DELETE") return await deletePost(post, viewer);
    if (sub === "like" && req.method === "POST") return await toggleLike(post, viewer);
    if (sub === "comments" && req.method === "GET") return json({ comments: await listComments(post.id, viewer.id) });
    if (sub === "comments" && req.method === "POST") return await addComment(req, post, viewer);
    return json({ error: "Not found" }, 404);
  } catch (error) {
    console.error("Posts API error:", error);
    return json({ error: "Something went wrong. Please try again." }, 500);
  }
};

export const config: Config = {
  path: ["/api/posts", "/api/posts/:id", "/api/posts/:id/:action", "/api/comments/:id"],
};
