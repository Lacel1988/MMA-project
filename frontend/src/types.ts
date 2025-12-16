export type Ful = "Auth" | "Fighters" | "Details" | "Compare";


export type Division = {
  id: number;
  name: string;
  min_weight?: string;
  max_weight?: string;
};

export type Fighter = {
  id: number;
  name: string;
  wins: number;
  losses: number;
  draw: number;

  age: number;
  height: number;
  weight: number;
  reach?: number | null;

  division: Division;

  upload_image?: string | null;
  description?: string | null;

  details_cover?: string | null;
  bio_long?: string | null;

  nickname?: string | null;
};

export type AuthUser = {
  id: number;
  username: string;
  email: string;
  is_staff: boolean;
  is_superuser: boolean;
};
