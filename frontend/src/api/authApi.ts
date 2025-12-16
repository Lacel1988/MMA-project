import { apiFetch, setToken } from "./client";

const AUTH_BASE = "http://127.0.0.1:8000/api/auth";

export type MeResponse = {
  id: number;
  username: string;
  email: string;
  is_staff: boolean;
  is_superuser: boolean;
};

export async function login(username: string, password: string) {
  const res = await fetch(`${AUTH_BASE}/token/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });

  if (!res.ok) {
    throw new Error("Login failed. Check username/password.");
  }

  const data: { access: string; refresh: string } = await res.json();
  setToken(data.access);
  return data;
}

export async function registerUser(username: string, email: string, password: string) {
  const res = await fetch(`${AUTH_BASE}/register/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, email, password }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data?.detail || "Registration failed.");
  }

  return data;
}

export async function fetchMe(): Promise<MeResponse> {
  const res = await apiFetch(`${AUTH_BASE}/me/`, { method: "GET" });
  if (!res.ok) throw new Error("Not authenticated");
  return res.json();
}

export function logout() {
  setToken(null);
}
