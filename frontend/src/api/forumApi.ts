import { apiFetch } from "./client";

const API_URL = "http://127.0.0.1:8000/api";

// ─────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────

export type Category = {
  id: number;
  name: string;
  description: string | null;
};

export type Topic = {
  id: number;
  title: string;
  description: string | null;
  category: Category;
  created_by: number;
  created_at: string;
};

export type Reply = {
  id: number;
  post: number;
  author: number;
  author_username: string;
  content: string;
  replied_at: string;
};

export type Post = {
  id: number;
  topic: number;
  author: number;
  author_username: string;
  content: string;
  posted_at: string;
  replies: Reply[];
  likes_count: number;
};

export type Like = {
  id: number;
  user_username: string;
  liked_at: string;
};

// ─────────────────────────────────────────────
// HELPER FUNCTIONS
// ─────────────────────────────────────────────

function unwrapList<T>(data: any): T[] {
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.results)) return data.results;
  return [];
}

async function readJson(res: Response): Promise<any> {
  return res.json().catch(() => ({}));
}

// ─────────────────────────────────────────────
// BASE ABSTRACT CLASS – BaseResource
// All resource classes extend this.
// Provides shared CRUD operations.
// ─────────────────────────────────────────────

abstract class BaseResource<TItem, TCreatePayload, TUpdatePayload> {
  protected abstract endpoint: string;

  protected get baseUrl(): string {
    return `${API_URL}/${this.endpoint}/`;
  }

  protected itemUrl(id: number): string {
    return `${this.baseUrl}${id}/`;
  }

  async list(query?: Record<string, string | number>): Promise<TItem[]> {
    const url = query
      ? `${this.baseUrl}?${new URLSearchParams(
          Object.entries(query).map(([k, v]) => [k, String(v)])
        )}`
      : this.baseUrl;
    const res = await apiFetch(url);
    const data = await readJson(res);
    if (!res.ok) throw new Error(`Failed to load ${this.endpoint}`);
    return unwrapList<TItem>(data);
  }

  async get(id: number): Promise<TItem> {
    const res = await apiFetch(this.itemUrl(id));
    const data = await readJson(res);
    if (!res.ok) throw new Error(`Failed to load ${this.endpoint} #${id}`);
    return data as TItem;
  }

  async create(payload: TCreatePayload): Promise<TItem> {
    const res = await apiFetch(this.baseUrl, {
      method: "POST",
      body: JSON.stringify(payload),
    });
    const data = await readJson(res);
    if (!res.ok) throw new Error(data?.detail || `Create ${this.endpoint} failed`);
    return data as TItem;
  }

  async update(id: number, payload: TUpdatePayload): Promise<TItem> {
    const res = await apiFetch(this.itemUrl(id), {
      method: "PUT",
      body: JSON.stringify(payload),
    });
    const data = await readJson(res);
    if (!res.ok) throw new Error(data?.detail || `Update ${this.endpoint} failed`);
    return data as TItem;
  }

  async delete(id: number): Promise<void> {
    const res = await apiFetch(this.itemUrl(id), { method: "DELETE" });
    if (!res.ok) throw new Error(`Delete ${this.endpoint} failed`);
  }
}

// ─────────────────────────────────────────────
// CATEGORY
// ─────────────────────────────────────────────

type CategoryCreatePayload = { name: string; description: string | null };
type CategoryUpdatePayload = CategoryCreatePayload;

class CategoryResource extends BaseResource<
  Category,
  CategoryCreatePayload,
  CategoryUpdatePayload
> {
  protected endpoint = "categories";
}

// ─────────────────────────────────────────────
// TOPIC
// ─────────────────────────────────────────────

type TopicCreatePayload = { title: string; description: string | null; category: number };
type TopicUpdatePayload = TopicCreatePayload;

class TopicResource extends BaseResource<
  Topic,
  TopicCreatePayload,
  TopicUpdatePayload
> {
  protected endpoint = "topics";

  async listByCategory(categoryId: number): Promise<Topic[]> {
    return this.list({ category: categoryId });
  }
}

// ─────────────────────────────────────────────
// POST
// ─────────────────────────────────────────────

type PostCreatePayload = { topic: number; content: string };
type PostUpdatePayload = { content: string };

class PostResource extends BaseResource<
  Post,
  PostCreatePayload,
  PostUpdatePayload
> {
  protected endpoint = "posts";

  async listByTopic(topicId: number): Promise<Post[]> {
    return this.list({ topic: topicId });
  }

  /** Fetch all likes for a given post */
  async listLikes(postId: number): Promise<Like[]> {
    const res = await apiFetch(`${this.itemUrl(postId)}likes/`);
    const data = await readJson(res);
    if (!res.ok) throw new Error(`Failed to load likes for post #${postId}`);
    return unwrapList<Like>(data);
  }

  /** Add a like to a post */
  async like(postId: number): Promise<{ likes_count: number }> {
    const res = await apiFetch(`${this.itemUrl(postId)}like/`, { method: "POST" });
    const data = await readJson(res);
    if (!res.ok) throw new Error(data?.detail || "Like failed");
    return data;
  }

  /** Remove a like from a post */
  async unlike(postId: number): Promise<{ likes_count: number }> {
    const res = await apiFetch(`${this.itemUrl(postId)}like/`, { method: "DELETE" });
    const data = await readJson(res);
    if (!res.ok) throw new Error(data?.detail || "Unlike failed");
    return data;
  }
}

// ─────────────────────────────────────────────
// REPLY
// ─────────────────────────────────────────────

type ReplyCreatePayload = { post: number; content: string };
type ReplyUpdatePayload = { content: string };

class ReplyResource extends BaseResource<
  Reply,
  ReplyCreatePayload,
  ReplyUpdatePayload
> {
  protected endpoint = "replies";

  async listByPost(postId: number): Promise<Reply[]> {
    return this.list({ post: postId });
  }
}

// ─────────────────────────────────────────────
// SINGLETON EXPORT
//
// Usage:
//   forumApi.categories.list()
//   forumApi.categories.create({ name: "Tech", description: null })
//   forumApi.topics.listByCategory(1)
//   forumApi.posts.listByTopic(2)
//   forumApi.posts.like(5)
//   forumApi.posts.unlike(5)
//   forumApi.posts.listLikes(5)
//   forumApi.replies.listByPost(3)
// ─────────────────────────────────────────────

export const forumApi = {
  categories: new CategoryResource(),
  topics:     new TopicResource(),
  posts:      new PostResource(),
  replies:    new ReplyResource(),
} as const;

// ─────────────────────────────────────────────
// BACKWARD-COMPATIBLE EXPORTS
// Legacy function-style API — no changes needed in existing code.
// ─────────────────────────────────────────────

export const listCategories = ()                                      => forumApi.categories.list();
export const createCategory = (p: CategoryCreatePayload)              => forumApi.categories.create(p);
export const updateCategory = (id: number, p: CategoryUpdatePayload)  => forumApi.categories.update(id, p);
export const deleteCategory = (id: number)                            => forumApi.categories.delete(id);

export const listTopics     = (categoryId?: number)                   => categoryId ? forumApi.topics.listByCategory(categoryId) : forumApi.topics.list();
export const getTopic       = (id: number)                            => forumApi.topics.get(id);
export const createTopic    = (p: TopicCreatePayload)                 => forumApi.topics.create(p);
export const updateTopic    = (id: number, p: TopicUpdatePayload)     => forumApi.topics.update(id, p);
export const deleteTopic    = (id: number)                            => forumApi.topics.delete(id);

export const listPosts      = (topicId?: number)                      => topicId ? forumApi.posts.listByTopic(topicId) : forumApi.posts.list();
export const getPost        = (id: number)                            => forumApi.posts.get(id);
export const createPost     = (p: PostCreatePayload)                  => forumApi.posts.create(p);
export const updatePost     = (id: number, p: PostUpdatePayload)      => forumApi.posts.update(id, p);
export const deletePost     = (id: number)                            => forumApi.posts.delete(id);

export const listReplies    = (postId?: number)                       => postId ? forumApi.replies.listByPost(postId) : forumApi.replies.list();
export const createReply    = (p: ReplyCreatePayload)                 => forumApi.replies.create(p);
export const updateReply    = (id: number, p: ReplyUpdatePayload)     => forumApi.replies.update(id, p);
export const deleteReply    = (id: number)                            => forumApi.replies.delete(id);

export const likePost       = (postId: number)                        => forumApi.posts.like(postId);
export const unlikePost     = (postId: number)                        => forumApi.posts.unlike(postId);
export const listPostLikes  = (postId: number)                        => forumApi.posts.listLikes(postId);