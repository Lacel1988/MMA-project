import { apiFetch } from "./client";

const API_URL = "http://127.0.0.1:8000/api";

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

function unwrapList<T>(data: any): T[] {
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.results)) return data.results;
  return [];
}

async function readJson(res: Response) {
  return res.json().catch(() => ({}));
}

/* CATEGORY */

export async function listCategories(): Promise<Category[]> {
  const res = await apiFetch(`${API_URL}/categories/`);
  const data = await readJson(res);
  if (!res.ok) throw new Error("Failed to load categories");
  return unwrapList<Category>(data);
}

export async function createCategory(payload: {
  name: string;
  description: string | null;
}): Promise<Category> {
  const res = await apiFetch(`${API_URL}/categories/`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
  const data = await readJson(res);
  if (!res.ok) throw new Error(data?.detail || "Create category failed");
  return data;
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
  if (!res.ok) throw new Error(data?.detail || "Update category failed");
  return data;
}

export async function deleteCategory(id: number): Promise<void> {
  const res = await apiFetch(`${API_URL}/categories/${id}/`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Delete category failed");
}