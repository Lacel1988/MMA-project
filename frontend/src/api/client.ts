const ACCESS_KEY = "access_token";
const REFRESH_KEY = "refresh_token";

type RefreshResponse = {
  access: string;
};

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
  const refreshToken = getRefreshToken();

  if (!refreshToken) {
    return null;
  }

  try {
    const res = await fetch("http://127.0.0.1:8000/api/auth/token/refresh/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refresh: refreshToken }),
    });

    const data = (await res.json().catch(() => ({}))) as Partial<RefreshResponse & { detail?: string }>;

    if (!res.ok || !data.access) {
      clearTokens();
      return null;
    }

    setAccessToken(data.access);
    return data.access;
  } catch {
    clearTokens();
    return null;
  }
}

export async function apiFetch(url: string, options: RequestInit = {}) {
  const createHeaders = (token: string | null) => {
    const headers = new Headers(options.headers || {});
    const hasBody = options.body !== undefined && options.body !== null;

    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }

    if (hasBody && !headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }

    return headers;
  };

  let accessToken = getAccessToken();

  let response = await fetch(url, {
    ...options,
    headers: createHeaders(accessToken),
  });

  if (response.status !== 401) {
    return response;
  }

  const newAccessToken = await tryRefreshAccessToken();

  if (!newAccessToken) {
    return response;
  }

  response = await fetch(url, {
    ...options,
    headers: createHeaders(newAccessToken),
  });

  return response;
}