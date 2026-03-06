const API_ORIGIN = "http://127.0.0.1:8000";

export function toAbsImageUrl(url: unknown): string | null {
  if (typeof url !== "string") return null;
  const u = url.trim();
  if (!u) return null;

  // már abszolút (http/https)
  if (u.startsWith("http://") || u.startsWith("https://")) return u;

  // relatív: /media/..., media/..., fighters/...
  if (u.startsWith("/")) return `${API_ORIGIN}${u}`;
  return `${API_ORIGIN}/${u}`;
}