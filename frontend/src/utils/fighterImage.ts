const API = "http://127.0.0.1:8000";

function normalizeToAbsUrl(maybeUrl: string): string {
  const url = (maybeUrl ?? "").trim();
  if (!url) return "";

  if (url.startsWith("http://") || url.startsWith("https://")) return url;

  if (url.startsWith("/")) return `${API}${url}`;
  return `${API}/${url}`;
}

export function getFighterImageUrl(f: any): string | null {
  const candidates = [
    // új stabil mezők (serializer adja)
    f?.upload_image_url,
    f?.details_cover_url,

    // fallback: ha csak relatív path jön
    f?.upload_image,
    f?.details_cover,

    // régi alternatív elnevezések, ha valahol még előfordul
    f?.image_url,
    f?.image,
    f?.photo,
    f?.photo_url,
    f?.portrait_url,
    f?.portrait,
    f?.img,
    f?.img_url,
  ];

  for (const c of candidates) {
    if (typeof c === "string" && c.trim()) return normalizeToAbsUrl(c);

    if (c && typeof c === "object") {
      const u = c.url ?? c.src ?? c.path ?? "";
      if (typeof u === "string" && u.trim()) return normalizeToAbsUrl(u);
    }
  }

  return null;
}