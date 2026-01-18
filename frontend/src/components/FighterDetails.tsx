import { Box, Typography, Chip, Divider } from "@mui/material";
import type { Fighter } from "../types";
import FighterAdminEditor from "./FighterAdminEditor";

type Props = {
  fighter: Fighter | null;
  mode?: "preview" | "full";
  isAdmin?: boolean;

  onUpdated?: (patch: Partial<Fighter>) => void;
};

export default function FighterDetails({
  fighter,
  mode = "preview",
  isAdmin = false,
  onUpdated,
}: Props) {
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
        {isAdmin ? <FighterAdminEditor fighter={fighter} onUpdated={onUpdated} /> : null}

        {/* viewer rész */}
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
