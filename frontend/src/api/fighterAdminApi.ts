import { apiFetch } from "./client";

const API_URL = "http://127.0.0.1:8000/api";

export type AdminUpdateFighterPatch = Partial<{
  nickname: string;
  description: string;
  bio_long: string;
  wins: number;
  losses: number;
  draw: number;
}>;

export async function adminUpdateFighter(
  fighterId: number,
  patch: AdminUpdateFighterPatch
) {
  const res = await apiFetch(`${API_URL}/fighters/${fighterId}/admin/`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(patch),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data?.detail || "Admin update failed.");
  }

  return data;
}
