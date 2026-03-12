const ACCESS_KEY = "access_token";
const REFRESH_KEY = "refresh_token";

export function setAccessToken(token: string) {
  localStorage.setItem(ACCESS_KEY, token);
}

export function getAccessToken(): string | null {
  return localStorage.getItem(ACCESS_KEY);
}

export function clearAccessToken() {
  localStorage.removeItem(ACCESS_KEY);
}

export function setRefreshToken(token: string) {
  localStorage.setItem(REFRESH_KEY, token);
}

export function getRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_KEY);
}

export function clearRefreshToken() {
  localStorage.removeItem(REFRESH_KEY);
}

export function clearTokens() {
  clearAccessToken();
  clearRefreshToken();
}

export async function tryRefreshAccessToken(): Promise<string | null> {
  return null;
}

export async function apiFetch(url: string, options: RequestInit = {}) {
  const headers = new Headers(options.headers || {});
  const hasBody = options.body !== undefined && options.body !== null;
  const accessToken = getAccessToken();

  if (accessToken) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }

  if (hasBody && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    clearTokens();
  }

  return response;
}