import {
  apiFetch,
  setAccessToken,
  setRefreshToken,
  clearTokens,
} from "./client";

const API_URL = "http://127.0.0.1:8000/api";

export type MeResponse = {
  id: number;
  username: string;
  email: string;
  is_staff: boolean;
  is_superuser: boolean;
};

type TokenResponse = {
  access: string;
  refresh: string;
};

export async function login(username: string, password: string): Promise<MeResponse> {
  const res = await apiFetch(`${API_URL}/auth/token/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });

  const data = (await res.json().catch(() => ({}))) as Partial<TokenResponse & { detail?: string }>;

  if (!res.ok || !data.access || !data.refresh) {
    throw new Error(data.detail || "Login failed.");
  }

  setAccessToken(data.access);
  setRefreshToken(data.refresh);

  return fetchMe();
}

export async function registerUser(
  username: string,
  email: string,
  password: string,
  password2: string
): Promise<MeResponse> {
  const res = await apiFetch(`${API_URL}/auth/register/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, email, password, password2 }),
  });

  const data = (await res.json().catch(() => ({}))) as any;

  if (!res.ok) {
    throw new Error(data?.detail || "Registration failed.");
  }

  return data as MeResponse;
}

export async function fetchMe(): Promise<MeResponse> {
  const res = await apiFetch(`${API_URL}/auth/me/`, { method: "GET" });
  const data = (await res.json().catch(() => ({}))) as any;

  if (!res.ok) {
    throw new Error(data?.detail || "Not authenticated.");
  }

  return data as MeResponse;
} 

export function hasAccessToken(): boolean {
  return !!localStorage.getItem("access_token");
}

export function getAccessToken(): string | null {
  return localStorage.getItem("access_token");
}

export function getRefreshToken(): string | null {
  return localStorage.getItem("refresh_token");
}

export function logout() {
  clearTokens();
}