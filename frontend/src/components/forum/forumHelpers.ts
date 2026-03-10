import type {
  UiReply,
  UiLike,
  UiPost,
  UiTopic,
  UiCategory,
} from "./forumTypes";

export function normalizeReply(raw: any): UiReply {
  return {
    id: Number(raw?.id ?? 0),
    author_username: String(raw?.author_username ?? "unknown"),
    content: String(raw?.content ?? ""),
    replied_at: String(raw?.replied_at ?? ""),
  };
}

export function normalizeLike(raw: any): UiLike {
  return {
    id: Number(raw?.id ?? 0),
    user_username: String(raw?.user_username ?? "unknown"),
    liked_at: String(raw?.liked_at ?? ""),
  };
}

export function normalizePost(raw: any, fallbackTopicId?: number): UiPost {
  return {
    id: Number(raw?.id ?? 0),
    author_username: String(raw?.author_username ?? "unknown"),
    content: String(raw?.content ?? ""),
    posted_at: String(raw?.posted_at ?? ""),
    topicId:
      typeof raw?.topic === "number"
        ? raw.topic
        : typeof raw?.topic_id === "number"
        ? raw.topic_id
        : fallbackTopicId,
    replies: Array.isArray(raw?.replies) ? raw.replies.map(normalizeReply) : [],
    likes: Array.isArray(raw?.likes) ? raw.likes.map(normalizeLike) : [],
  };
}

export function normalizeTopic(raw: any): UiTopic {
  const categoryId =
    typeof raw?.category_id === "number"
      ? raw.category_id
      : typeof raw?.category?.id === "number"
      ? raw.category.id
      : typeof raw?.category === "number"
      ? raw.category
      : 0;

  return {
    id: Number(raw?.id ?? 0),
    title: String(raw?.title ?? ""),
    description: raw?.description ?? null,
    category_id: categoryId,
    created_by_username: raw?.created_by_username
      ? String(raw.created_by_username)
      : undefined,
    created_at: raw?.created_at ? String(raw.created_at) : undefined,
    posts: Array.isArray(raw?.posts)
      ? raw.posts.map((p: any) => normalizePost(p, Number(raw?.id ?? 0)))
      : [],
  };
}

export function normalizeCategory(raw: any): UiCategory {
  return {
    id: Number(raw?.id ?? 0),
    name: String(raw?.name ?? ""),
    description: raw?.description ?? null,
    topics: Array.isArray(raw?.topics) ? raw.topics.map(normalizeTopic) : [],
  };
}

export function formatDate(value?: string): string {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("hu-HU");
}

export function userInitial(name: string): string {
  return (name?.trim()?.charAt(0) || "?").toUpperCase();
}

export function roleLabel(name?: string): string {
  if (!name) return "";
  return name === "admin" ? "superuser" : "staff";
}