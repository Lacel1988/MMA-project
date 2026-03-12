import { Box, Chip, Paper, Typography } from "@mui/material";
import type { Fighter } from "../../types";

type Props = {
  fighter: Fighter | null;
  title: string;
};

export default function FighterCompareCard({ fighter, title }: Props) {
  return (
    <Paper
      elevation={0}
      sx={{
        bgcolor: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 3,
        overflow: "hidden",
        color: "white",
        height: "100%",
      }}
    >
      <Box sx={{ p: { xs: 1.5, sm: 2 } }}>
        <Typography
          sx={{
            opacity: 0.75,
            fontWeight: 800,
            letterSpacing: 0.6,
            fontSize: { xs: 13, sm: 14 },
          }}
        >
          {title}
        </Typography>

        {!fighter ? (
          <Typography sx={{ mt: 2, opacity: 0.8 }}>Select a fighter.</Typography>
        ) : (
          <Box
            sx={{
              mt: 1,
              display: "flex",
              gap: { xs: 1.5, sm: 2 },
              alignItems: { xs: "stretch", sm: "center" },
              flexDirection: { xs: "column", sm: "row" },
            }}
          >
            <Box
              sx={{
                width: { xs: "100%", sm: 200 },
                maxWidth: { xs: 260, sm: 200 },
                mx: { xs: "auto", sm: 0 },
                aspectRatio: "1 / 1",
                borderRadius: 2,
                bgcolor: "#0c0c0c",
                border: "1px solid rgba(255,255,255,0.08)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                overflow: "hidden",
                flexShrink: 0,
              }}
            >
              {fighter.upload_image ? (
                <Box
                  component="img"
                  src={fighter.upload_image}
                  alt={fighter.name}
                  sx={{ width: "100%", height: "100%", objectFit: "contain" }}
                />
              ) : (
                <Typography sx={{ opacity: 0.6, fontSize: { xs: 18, sm: 22 } }}>
                  No image
                </Typography>
              )}
            </Box>

            <Box sx={{ minWidth: 0, width: "100%" }}>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 900,
                  lineHeight: 1.15,
                  fontSize: { xs: "1.05rem", sm: "1.25rem" },
                  wordBreak: "break-word",
                }}
              >
                {fighter.name}
              </Typography>

              {fighter.nickname ? (
                <Typography
                  sx={{
                    opacity: 0.85,
                    fontStyle: "italic",
                    wordBreak: "break-word",
                  }}
                >
                  "{fighter.nickname}"
                </Typography>
              ) : null}

              <Box sx={{ mt: 1, display: "flex", gap: 1, flexWrap: "wrap" }}>
                <Chip
                  label={fighter.division.name}
                  size="small"
                  sx={{
                    bgcolor: "#b71c1c",
                    color: "#fff",
                    fontWeight: 800,
                    maxWidth: "100%",
                    "& .MuiChip-label": {
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    },
                  }}
                />
                <Chip
                  label={`${fighter.wins}-${fighter.losses}-${fighter.draw}`}
                  size="small"
                  sx={{ bgcolor: "rgba(255,255,255,0.08)", color: "#fff" }}
                />
              </Box>
            </Box>
          </Box>
        )}
      </Box>
    </Paper>
  );
}