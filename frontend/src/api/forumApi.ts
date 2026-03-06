import { apiFetch } from "./client";

const API_URL = "http://127.0.0.1:8000/api";

/* ========================
   TYPES
======================== */

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

export type PostLike = {
  id: number;
  post: number;
  user: number;
  user_username: string;
  liked_at: string;
};

/* ========================
   HELPERS
======================== */

function unwrapList<T>(data: any): T[] {
  if (Array.isArray(data)) return data as T[];
  if (data && Array.isArray((data as any).results)) return (data as any).results as T[];
  return [];
}

async function readJson(res: Response) {
  return res.json().catch(() => ({}));
}

/* ========================
   CATEGORY
======================== */

export async function listCategories(): Promise<Category[]> {
  const res = await apiFetch(`${API_URL}/categories/`, { method: "GET" });
  const data = await readJson(res);
  if (!res.ok) throw new Error((data as any)?.detail || "Failed to load categories.");
  return unwrapList<Category>(data);
}

export async function createCategory(payload: { name: string; description: string | null }): Promise<Category> {
  const res = await apiFetch(`${API_URL}/categories/`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
  const data = await readJson(res);
  if (!res.ok) throw new Error((data as any)?.detail || "Create category failed.");
  return data as Category;
}

export async function updateCategory(
  id: number,
  payload: { name: string; description: string | null }
): Promise<Category> {
  const res = await apiFetch(`${API_URL}/categories/${id}/`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
  const data = await readJson(res);
  if (!res.ok) throw new Error((data as any)?.detail || "Update category failed.");
  return data as Category;
}

export async function deleteCategory(id: number): Promise<void> {
  const res = await apiFetch(`${API_URL}/categories/${id}/`, { method: "DELETE" });
  if (!res.ok) {
    const data = await readJson(res);
    throw new Error((data as any)?.detail || "Delete category failed.");
  }
}

/* ========================
   TOPIC
======================== */

export async function listTopics(): Promise<Topic[]> {
  const res = await apiFetch(`${API_URL}/topics/`, { method: "GET" });
  const data = await readJson(res);
  if (!res.ok) throw new Error((data as any)?.detail || "Failed to load topics.");
  return unwrapList<Topic>(data);
}

export async function createTopic(payload: {
  title: string;
  description: string | null;
  category_id: number;
}): Promise<Topic> {
  const res = await apiFetch(`${API_URL}/topics/`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
  const data = await readJson(res);
  if (!res.ok) throw new Error((data as any)?.detail || "Create topic failed.");
  return data as Topic;
}

/* ========================
   POST
======================== */

export async function listPosts(): Promise<Post[]> {
  const res = await apiFetch(`${API_URL}/posts/`, { method: "GET" });
  const data = await readJson(res);
  if (!res.ok) throw new Error((data as any)?.detail || "Failed to load posts.");
  return unwrapList<Post>(data);
}

export async function createPost(payload: { topic: number; content: string }): Promise<Post> {
  const res = await apiFetch(`${API_URL}/posts/`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
  const data = await readJson(res);
  if (!res.ok) throw new Error((data as any)?.detail || "Create post failed.");
  return data as Post;
}

/* ========================
   REPLY
======================== */

export async function createReply(payload: { post: number; content: string }): Promise<Reply> {
  const res = await apiFetch(`${API_URL}/replies/`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
  const data = await readJson(res);
  if (!res.ok) throw new Error((data as any)?.detail || "Create reply failed.");
  return data as Reply;
}

/* ========================
   LIKE
======================== */

export async function likePost(postId: number): Promise<PostLike> {
  const res = await apiFetch(`${API_URL}/likes/`, {
    method: "POST",
    body: JSON.stringify({ post: postId }),
  });
  const data = await readJson(res);
  if (!res.ok) throw new Error((data as any)?.detail || "Like failed.");
  return data as PostLike;
}

export async function unlikePost(likeId: number): Promise<void> {
  const res = await apiFetch(`${API_URL}/likes/${likeId}/`, { method: "DELETE" });
  if (!res.ok) {
    const data = await readJson(res);
    throw new Error((data as any)?.detail || "Unlike failed.");
  }
}