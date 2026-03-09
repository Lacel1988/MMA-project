import { apiFetch } from "./client";

const API_URL = "http://127.0.0.1:8000/api";

// TYPES

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
  created_by_username?: string;
  created_at: string;
  posts?: Post[];
};

export type Reply = {
  id: number;
  post?: number;
  author: number;
  author_username: string;
  content: string;
  replied_at: string;
};

export type PostLike = {
  id: number;
  post?: number;
  user: number;
  user_username: string;
  liked_at: string;
};

export type Post = {
  id: number;
  topic?: number;
  author: number;
  author_username: string;
  content: string;
  posted_at: string;
  replies: Reply[];
  likes: PostLike[];
};

// HELPERS

function unwrapList<T>(adat: any): T[] {
  if (Array.isArray(adat)) return adat as T[];
  if (adat && Array.isArray(adat.results)) return adat.results as T[];
  return [];
}

async function readJson(res: Response): Promise<any> {
  return res.json().catch(() => ({}));
}

// BASE RESOURCE

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
          Object.entries(query).map(([kulcs, ertek]) => [kulcs, String(ertek)])
        )}`
      : this.baseUrl;

    const res = await apiFetch(url, { method: "GET" });
    const adat = await readJson(res);

    if (!res.ok) {
      throw new Error(adat?.detail || `Failed to load ${this.endpoint}.`);
    }

    return unwrapList<TItem>(adat);
  }

  async get(id: number): Promise<TItem> {
    const res = await apiFetch(this.itemUrl(id), { method: "GET" });
    const adat = await readJson(res);

    if (!res.ok) {
      throw new Error(adat?.detail || `Failed to load ${this.endpoint} #${id}.`);
    }

    return adat as TItem;
  }

  async create(payload: TCreatePayload): Promise<TItem> {
    const res = await apiFetch(this.baseUrl, {
      method: "POST",
      body: JSON.stringify(payload),
    });
    const adat = await readJson(res);

    if (!res.ok) {
      throw new Error(adat?.detail || `Create ${this.endpoint} failed.`);
    }

    return adat as TItem;
  }

  async update(id: number, payload: TUpdatePayload): Promise<TItem> {
    const res = await apiFetch(this.itemUrl(id), {
      method: "PUT",
      body: JSON.stringify(payload),
    });
    const adat = await readJson(res);

    if (!res.ok) {
      throw new Error(adat?.detail || `Update ${this.endpoint} failed.`);
    }

    return adat as TItem;
  }

  async delete(id: number): Promise<void> {
    const res = await apiFetch(this.itemUrl(id), { method: "DELETE" });

    if (!res.ok) {
      const adat = await readJson(res);
      throw new Error(adat?.detail || `Delete ${this.endpoint} failed.`);
    }
  }
}

// CATEGORY

type CategoryCreatePayload = {
  name: string;
  description: string | null;
};

type CategoryUpdatePayload = CategoryCreatePayload;

class CategoryResource extends BaseResource<
  Category,
  CategoryCreatePayload,
  CategoryUpdatePayload
> {
  protected endpoint = "categories";
}

// TOPIC

type TopicCreatePayload = {
  title: string;
  description: string | null;
  category_id: number;
};

type TopicUpdatePayload = TopicCreatePayload;

class TopicResource extends BaseResource<
  Topic,
  TopicCreatePayload,
  TopicUpdatePayload
> {
  protected endpoint = "topics";
}

// POST

type PostCreatePayload = {
  topic_id: number;
  content: string;
};

type PostUpdatePayload = {
  topic_id?: number;
  content: string;
};

class PostResource extends BaseResource<
  Post,
  PostCreatePayload,
  PostUpdatePayload
> {
  protected endpoint = "posts";
}

// REPLY

type ReplyCreatePayload = {
  post_id: number;
  content: string;
};

type ReplyUpdatePayload = {
  post_id?: number;
  content: string;
};

class ReplyResource extends BaseResource<
  Reply,
  ReplyCreatePayload,
  ReplyUpdatePayload
> {
  protected endpoint = "replies";
}

// LIKE

type PostLikeCreatePayload = {
  post_id: number;
};

class PostLikeResource extends BaseResource<
  PostLike,
  PostLikeCreatePayload,
  never
> {
  protected endpoint = "likes";

  async create(payload: PostLikeCreatePayload): Promise<PostLike> {
    const res = await apiFetch(this.baseUrl, {
      method: "POST",
      body: JSON.stringify(payload),
    });
    const adat = await readJson(res);

    if (!res.ok) {
      throw new Error(adat?.detail || "Like failed.");
    }

    return adat as PostLike;
  }

  async delete(id: number): Promise<void> {
    const res = await apiFetch(this.itemUrl(id), { method: "DELETE" });

    if (!res.ok) {
      const adat = await readJson(res);
      throw new Error(adat?.detail || "Unlike failed.");
    }
  }
}

// SINGLETON EXPORT

export const forumApi = {
  categories: new CategoryResource(),
  topics: new TopicResource(),
  posts: new PostResource(),
  replies: new ReplyResource(),
  likes: new PostLikeResource(),
} as const;

// BACKWARD-COMPATIBLE EXPORTS

export const listCategories = () => forumApi.categories.list();
export const createCategory = (p: CategoryCreatePayload) => forumApi.categories.create(p);
export const updateCategory = (id: number, p: CategoryUpdatePayload) =>
  forumApi.categories.update(id, p);
export const deleteCategory = (id: number) => forumApi.categories.delete(id);

export const listTopics = () => forumApi.topics.list();
export const getTopic = (id: number) => forumApi.topics.get(id);
export const createTopic = (p: TopicCreatePayload) => forumApi.topics.create(p);
export const updateTopic = (id: number, p: TopicUpdatePayload) =>
  forumApi.topics.update(id, p);
export const deleteTopic = (id: number) => forumApi.topics.delete(id);

export const listPosts = () => forumApi.posts.list();
export const getPost = (id: number) => forumApi.posts.get(id);
export const createPost = (p: PostCreatePayload) => forumApi.posts.create(p);
export const updatePost = (id: number, p: PostUpdatePayload) =>
  forumApi.posts.update(id, p);
export const deletePost = (id: number) => forumApi.posts.delete(id);

export const listReplies = () => forumApi.replies.list();
export const createReply = (p: ReplyCreatePayload) => forumApi.replies.create(p);
export const updateReply = (id: number, p: ReplyUpdatePayload) =>
  forumApi.replies.update(id, p);
export const deleteReply = (id: number) => forumApi.replies.delete(id);

export const listPostLikes = () => forumApi.likes.list();
export const likePost = (postId: number) => forumApi.likes.create({ post_id: postId });
export const unlikePost = (likeId: number) => forumApi.likes.delete(likeId);