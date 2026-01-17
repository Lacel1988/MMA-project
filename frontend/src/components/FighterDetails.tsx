import { Box, Typography, Chip, Divider, Button, TextField } from "@mui/material";
import { useEffect, useState } from "react";
import type { Fighter } from "../types";
import { adminUpdateFighter } from "../api/fighterAdminApi";

type Props = {
  fighter: Fighter | null;
  mode?: "preview" | "full";
  isAdmin?: boolean;

  // opcionális: ha App.tsx-ben szeretnéd azonnal frissíteni a state-et mentés után
  onUpdated?: (patch: Partial<Fighter>) => void;
};

export default function FighterDetails({
  fighter,
  mode = "preview",
  isAdmin = false,
  onUpdated,
}: Props) {
  // --- admin draft state-ek ---
  const [nickDraft, setNickDraft] = useState("");
  const [descDraft, setDescDraft] = useState("");
  const [bioDraft, setBioDraft] = useState("");

  const [saving, setSaving] = useState(false);
  const [hiba, setHiba] = useState("");
  const [ok, setOk] = useState("");

  // fighter váltáskor frissítsük a draftokat (KULCS!)
  useEffect(() => {
    setHiba("");
    setOk("");
    setNickDraft(fighter?.nickname ?? "");
    setDescDraft(fighter?.description ?? "");
    setBioDraft(fighter?.bio_long ?? "");
  }, [fighter?.id]);

  async function handleAdminSave() {
    if (!fighter) return;

    setSaving(true);
    setHiba("");
    setOk("");

    // csak a változott mezőket küldjük
    const patch: Record<string, any> = {};

    if ((nickDraft ?? "") !== (fighter.nickname ?? "")) patch.nickname = nickDraft;
    if ((descDraft ?? "") !== (fighter.description ?? "")) patch.description = descDraft;
    if ((bioDraft ?? "") !== (fighter.bio_long ?? "")) patch.bio_long = bioDraft;

    if (Object.keys(patch).length === 0) {
      setSaving(false);
      setHiba("No changes to save.");
      return;
    }

    try {
      const updated = await adminUpdateFighter(fighter.id, patch);

      // backend response tipikusan: {id, nickname, description, bio_long}
      // ebből UI-t frissítünk (ha App.tsx átadja)
      onUpdated?.(updated);

      setOk("Saved.");
    } catch (e: any) {
      setHiba(e?.message || "Admin update failed.");
    } finally {
      setSaving(false);
    }
  }

  if (!fighter) {
    return (
      <Box
        sx={{
          bgcolor: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 3,
          p: 2,
          color: "white",
          height: mode === "preview" ? { lg: "100%" } : "auto",
          display: "flex",
          alignItems: "center",
        }}
      >
        <Typography sx={{ opacity: 0.8 }}>
          Select a fighter on the left to view details.
        </Typography>
      </Box>
    );
  }

  const kep =
    mode === "full"
      ? fighter.details_cover ?? fighter.upload_image ?? null
      : fighter.upload_image ?? fighter.details_cover ?? null;

  const szoveg =
    mode === "full"
      ? fighter.bio_long ?? fighter.description ?? ""
      : fighter.description ??
        (fighter.bio_long ? fighter.bio_long.slice(0, 240) + "..." : "");

  return (
    <Box
      sx={{
        bgcolor: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 3,
        overflow: "hidden",
        color: "white",
        height: mode === "preview" ? { lg: "100%" } : "auto",
        display: "flex",
        flexDirection: "column",
        minHeight: 0,
      }}
    >
      <Box
        sx={{
          height: mode === "full" ? 420 : 320,
          flexShrink: 0,
          bgcolor: "#0c0c0c",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {kep ? (
          <Box
            component="img"
            src={kep}
            alt={fighter.name}
            sx={{ maxHeight: "100%", maxWidth: "100%", objectFit: "contain" }}
          />
        ) : (
          <Typography sx={{ opacity: 0.7 }}>No image</Typography>
        )}
      </Box>

      <Box
        sx={{
          p: 2,
          display: "flex",
          flexDirection: "column",
          flexGrow: 1,
          minHeight: 0,
        }}
      >
        <Typography variant="h5" sx={{ fontWeight: 900 }}>
          {fighter.name}
        </Typography>

        {/* ADMIN EDITOR */}
        {isAdmin && (
          <Box
            sx={{
              mt: 1.5,
              p: 1.5,
              borderRadius: 2,
              border: "1px solid rgba(183,28,28,0.55)",
              bgcolor: "rgba(183,28,28,0.08)",
              display: "grid",
              gap: 1.25,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
              <Chip
                label="ADMIN MODE"
                size="small"
                sx={{
                  bgcolor: "#b71c1c",
                  color: "#fff",
                  fontWeight: 900,
                  letterSpacing: 0.6,
                }}
              />
              <Typography sx={{ fontSize: 13, color: "#fff", opacity: 0.85 }}>
                Admin-only controls
              </Typography>

              <Box sx={{ flexGrow: 1 }} />

              <Button
                onClick={() => {
                  setHiba("");
                  setOk("");
                  setNickDraft(fighter.nickname ?? "");
                  setDescDraft(fighter.description ?? "");
                  setBioDraft(fighter.bio_long ?? "");
                }}
                size="small"
                sx={{
                  textTransform: "none",
                  fontWeight: 900,
                  color: "rgba(255,255,255,0.9)",
                }}
              >
                Reset
              </Button>
            </Box>

            <TextField
              label="Nickname"
              value={nickDraft}
              onChange={(e) => setNickDraft(e.target.value)}
              size="small"
              InputLabelProps={{ sx: { color: "rgba(255,255,255,0.75)" } }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  bgcolor: "rgba(255,255,255,0.04)",
                  color: "white",
                },
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: "rgba(255,255,255,0.18)",
                },
              }}
            />

            <TextField
              label="Description"
              value={descDraft}
              onChange={(e) => setDescDraft(e.target.value)}
              size="small"
              multiline
              minRows={2}
              InputLabelProps={{ sx: { color: "rgba(255,255,255,0.75)" } }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  bgcolor: "rgba(255,255,255,0.04)",
                  color: "white",
                },
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: "rgba(255,255,255,0.18)",
                },
              }}
            />

            <TextField
              label="Bio (long)"
              value={bioDraft}
              onChange={(e) => setBioDraft(e.target.value)}
              size="small"
              multiline
              minRows={3}
              InputLabelProps={{ sx: { color: "rgba(255,255,255,0.75)" } }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  bgcolor: "rgba(255,255,255,0.04)",
                  color: "white",
                },
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: "rgba(255,255,255,0.18)",
                },
              }}
            />

            {/* feedback */}
            {hiba ? (
              <Typography sx={{ color: "#ff6b6b", fontSize: 13 }}>{hiba}</Typography>
            ) : null}
            {ok ? (
              <Typography sx={{ color: "#9cff9c", fontSize: 13 }}>{ok}</Typography>
            ) : null}

            <Box sx={{ display: "flex", gap: 1, justifyContent: "flex-end" }}>
              <Button
                onClick={handleAdminSave}
                disabled={saving}
                variant="contained"
                sx={{
                  textTransform: "none",
                  fontWeight: 900,
                  bgcolor: "#b71c1c",
                  "&:hover": { bgcolor: "#c62828" },
                }}
              >
                {saving ? "Saving..." : "Save changes"}
              </Button>
            </Box>
          </Box>
        )}
        {/* ADMIN EDITOR END */}

        {/* megjelenítés (a viewer rész) */}
        {fighter.nickname ? (
          <Typography sx={{ opacity: 0.85, fontStyle: "italic" }}>
            "{fighter.nickname}"
          </Typography>
        ) : null}

        <Box sx={{ mt: 1, display: "flex", gap: 1, flexWrap: "wrap" }}>
          <Chip
            label={fighter.division.name}
            sx={{ bgcolor: "#b71c1c", color: "#fff", fontWeight: 800 }}
          />
          <Chip
            label={`Record: ${fighter.wins}-${fighter.losses}-${fighter.draw}`}
            sx={{ bgcolor: "rgba(255,255,255,0.08)", color: "#fff" }}
          />
          <Chip
            label={`Reach: ${fighter.reach ?? "-"}`}
            sx={{ bgcolor: "rgba(255,255,255,0.08)", color: "#fff" }}
          />
        </Box>

        <Divider sx={{ my: 2, borderColor: "rgba(255,255,255,0.10)" }} />

        <Box
          sx={{
            flexGrow: 1,
            minHeight: 0,
            overflowY: mode === "preview" ? "auto" : "visible",
            pr: mode === "preview" ? 1 : 0,
          }}
        >
          <Typography sx={{ opacity: 0.9, whiteSpace: "pre-wrap", lineHeight: 1.6 }}>
            {szoveg || "No description."}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
