const ACCESS_KEY = "access_token";

export function setAccessToken(token: string) {
  localStorage.setItem(ACCESS_KEY, token);
}

export function getAccessToken(): string | null {
  return localStorage.getItem(ACCESS_KEY);
}

export function clearAccessToken() {
  localStorage.removeItem(ACCESS_KEY);
}

export async function apiFetch(url: string, options: RequestInit = {}) {
  const token = getAccessToken();

  // fejlécek összeolvasztása (NE veszítsük el a hívó headerét)
  const headers = new Headers(options.headers || {});

  // ha van token, tegyük rá
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  // ha a hívó nem adott Content-Type-ot, és van body -> JSON
  const hasBody = options.body !== undefined && options.body !== null;
  if (hasBody && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  return fetch(url, {
    ...options,
    headers,
  });
}
