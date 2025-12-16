import { Box, Typography, Chip, Divider, Button } from "@mui/material";
import type { Fighter } from "../types";

type Props = {
  fighter: Fighter | null;
  mode?: "preview" | "full";
  onOpenFull?: () => void;
};

export default function FighterDetails({ fighter, mode = "preview", onOpenFull }: Props) {
  if (!fighter) {
    return (
      <Box
        sx={{
          bgcolor: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 3,
          p: 2,
          color: "white",
          position: "sticky",
          top: 16,
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
      : fighter.description ?? (fighter.bio_long ? fighter.bio_long.slice(0, 240) + "..." : "");

  return (
    <Box
      sx={{
        bgcolor: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 3,
        overflow: "hidden",
        color: "white",
        position: mode === "preview" ? "sticky" : "relative",
        top: mode === "preview" ? 16 : "auto",
      }}
    >
      <Box
        sx={{
          height: mode === "full" ? 420 : 320,
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

      <Box sx={{ p: 2 }}>
        <Typography variant="h5" sx={{ fontWeight: 900 }}>
          {fighter.name}
        </Typography>

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

        <Typography
          sx={{
            opacity: 0.9,
            whiteSpace: "pre-wrap",
            lineHeight: 1.6,
            ...(mode === "preview"
              ? {
                  display: "-webkit-box",
                  WebkitLineClamp: 6,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                }
              : {}),
          }}
        >
          {szoveg || "No description."}
        </Typography>

        {mode === "preview" && onOpenFull ? (
          <Button
            onClick={onOpenFull}
            sx={{
              mt: 2,
              bgcolor: "rgba(255,255,255,0.08)",
              color: "white",
              fontWeight: 900,
              "&:hover": { bgcolor: "rgba(255,255,255,0.14)" },
            }}
          >
            Open full details
          </Button>
        ) : null}
      </Box>
    </Box>
  );
}
