import { Box, Typography, Chip, Button, TextField } from "@mui/material";
import { useEffect, useState } from "react";
import type { Fighter } from "../types";
import { adminUpdateFighter } from "../api/fighterAdminApi";

type Props = {
  fighter: Fighter;
  onUpdated?: (patch: Partial<Fighter>) => void;
};

export default function FighterAdminEditor({ fighter, onUpdated }: Props) {
  const [nickDraft, setNickDraft] = useState("");
  const [descDraft, setDescDraft] = useState("");
  const [bioDraft, setBioDraft] = useState("");

  // stat draftok stringként (hogy lehessen törölni / gépelni)
  const [winsDraft, setWinsDraft] = useState("0");
  const [lossesDraft, setLossesDraft] = useState("0");
  const [drawDraft, setDrawDraft] = useState("0");

  const [saving, setSaving] = useState(false);
  const [hiba, setHiba] = useState("");
  const [ok, setOk] = useState("");

  useEffect(() => {
    setHiba("");
    setOk("");
    setNickDraft(fighter.nickname ?? "");
    setDescDraft(fighter.description ?? "");
    setBioDraft(fighter.bio_long ?? "");

    setWinsDraft(String(fighter.wins ?? 0));
    setLossesDraft(String(fighter.losses ?? 0));
    setDrawDraft(String(fighter.draw ?? 0));
  }, [fighter.id]);

  function handleReset() {
    setHiba("");
    setOk("");
    setNickDraft(fighter.nickname ?? "");
    setDescDraft(fighter.description ?? "");
    setBioDraft(fighter.bio_long ?? "");

    setWinsDraft(String(fighter.wins ?? 0));
    setLossesDraft(String(fighter.losses ?? 0));
    setDrawDraft(String(fighter.draw ?? 0));
  }

  function toIntSafe(s: string): number | null {
    // engedjük az üres stringet gépelés közben, de mentéskor már ne
    if (s.trim() === "") return null;
    const n = Number(s);
    if (!Number.isFinite(n)) return null;
    // UFC statoknál nem kell tizedes
    return Math.max(0, Math.trunc(n));
  }

  async function handleAdminSave() {
    setSaving(true);
    setHiba("");
    setOk("");

    const patch: Record<string, any> = {};

    if ((nickDraft ?? "") !== (fighter.nickname ?? "")) patch.nickname = nickDraft;
    if ((descDraft ?? "") !== (fighter.description ?? "")) patch.description = descDraft;
    if ((bioDraft ?? "") !== (fighter.bio_long ?? "")) patch.bio_long = bioDraft;

    // statok validálása
    const winsInt = toIntSafe(winsDraft);
    const lossesInt = toIntSafe(lossesDraft);
    const drawInt = toIntSafe(drawDraft);

    if (winsInt === null || lossesInt === null || drawInt === null) {
      setSaving(false);
      setHiba("Wins/Losses/Draw must be whole numbers.");
      return;
    }

    if (winsInt !== (fighter.wins ?? 0)) patch.wins = winsInt;
    if (lossesInt !== (fighter.losses ?? 0)) patch.losses = lossesInt;
    if (drawInt !== (fighter.draw ?? 0)) patch.draw = drawInt;

    if (Object.keys(patch).length === 0) {
      setSaving(false);
      setHiba("No changes to save.");
      return;
    }

    try {
      const updated = await adminUpdateFighter(fighter.id, patch);
      onUpdated?.(updated);
      setOk("Saved.");
    } catch (e: any) {
      setHiba(e?.message || "Admin update failed.");
    } finally {
      setSaving(false);
    }
  }

  const fieldSx = {
    "& .MuiOutlinedInput-root": {
      bgcolor: "rgba(255,255,255,0.04)",
      color: "white",
    },
    "& .MuiOutlinedInput-notchedOutline": {
      borderColor: "rgba(255,255,255,0.18)",
    },
  };

  return (
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
          onClick={handleReset}
          size="small"
          sx={{ textTransform: "none", fontWeight: 900, color: "rgba(255,255,255,0.9)" }}
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
        sx={fieldSx}
      />

      <TextField
        label="Description"
        value={descDraft}
        onChange={(e) => setDescDraft(e.target.value)}
        size="small"
        multiline
        minRows={2}
        InputLabelProps={{ sx: { color: "rgba(255,255,255,0.75)" } }}
        sx={fieldSx}
      />

      <TextField
        label="Bio (long)"
        value={bioDraft}
        onChange={(e) => setBioDraft(e.target.value)}
        size="small"
        multiline
        minRows={3}
        InputLabelProps={{ sx: { color: "rgba(255,255,255,0.75)" } }}
        sx={fieldSx}
      />

      {/* STATOK */}
      <Box sx={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 1 }}>
        <TextField
          label="Wins"
          type="number"
          value={winsDraft}
          onChange={(e) => setWinsDraft(e.target.value)}
          size="small"
          InputLabelProps={{ sx: { color: "rgba(255,255,255,0.75)" } }}
          sx={fieldSx}
        />
        <TextField
          label="Losses"
          type="number"
          value={lossesDraft}
          onChange={(e) => setLossesDraft(e.target.value)}
          size="small"
          InputLabelProps={{ sx: { color: "rgba(255,255,255,0.75)" } }}
          sx={fieldSx}
        />
        <TextField
          label="Draw"
          type="number"
          value={drawDraft}
          onChange={(e) => setDrawDraft(e.target.value)}
          size="small"
          InputLabelProps={{ sx: { color: "rgba(255,255,255,0.75)" } }}
          sx={fieldSx}
        />
      </Box>

      {hiba ? <Typography sx={{ color: "#ff6b6b", fontSize: 13 }}>{hiba}</Typography> : null}
      {ok ? <Typography sx={{ color: "#9cff9c", fontSize: 13 }}>{ok}</Typography> : null}

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
  );
}
