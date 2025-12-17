import { Card, CardContent, Chip, Box, Typography } from "@mui/material";
import type { Fighter } from "../types";

type Props = {
  fighters: Fighter[];
  onSelect: (f: Fighter) => void;
  selectedId: number | null;
};

export default function FighterGrid({ fighters, onSelect, selectedId }: Props) {
  return (
    <Box
      sx={{
        display: "grid",
        gap: 3,
        gridTemplateColumns: {
          xs: "1fr",
          sm: "repeat(2, 1fr)",
          md: "repeat(3, 1fr)",
          lg: "repeat(4, 1fr)",
          xl: "repeat(5, 1fr)",
        },
        alignItems: "stretch",
      }}
    >
      {fighters.map((f) => (
        <Card
          key={f.id}
          onClick={() => onSelect(f)}
          sx={{
            cursor: "pointer",
            bgcolor: "#1e1e1e",
            color: "white",
            border:
              selectedId === f.id
                ? "2px solid rgba(183,28,28,0.9)"
                : "1px solid rgba(255,255,255,0.08)",
            borderRadius: 3,
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            transition: "transform 150ms ease, box-shadow 150ms ease",
            "&:hover": {
              transform: "translateY(-4px)",
              boxShadow: "0 12px 30px rgba(0,0,0,0.6)",
            },
          }}
        >
          <Box
            sx={{
              height: 280,
              width: "100%",
              bgcolor: "#111",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              overflow: "hidden",
            }}
          >
            {f.upload_image ? (
              <Box
                component="img"
                src={f.upload_image}
                alt={f.name}
                sx={{
                  maxHeight: "100%",
                  maxWidth: "100%",
                  objectFit: "contain",
                  transition: "transform 200ms ease",
                  "&:hover": { transform: "scale(1.03)" },
                }}
              />
            ) : (
              <Typography sx={{ opacity: 0.7 }}>No image</Typography>
            )}
          </Box>

          <CardContent
            sx={{
              display: "flex",
              flexDirection: "column",
              flexGrow: 1,
              minHeight: 0,
            }}
          >
            <Typography
              variant="h6"
              sx={{
                minHeight: "3em",
                lineHeight: "1.5em",
                overflow: "hidden",
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                wordBreak: "break-word",
              }}
            >
              {f.name}
            </Typography>

            <Chip
              label={
                <Box
                  sx={{
                    display: "block",
                    maxWidth: "100%",
                    minWidth: 0,
                    whiteSpace: "nowrap",     // ← KULCS
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    lineHeight: 1.2,
                  }}
                >
                  {f.division?.name ?? "No division"}
                </Box>
              }
              size="small"
              sx={{
                mt: 1,
                mb: 1,
                bgcolor: "#b71c1c",
                color: "#fff",
                fontWeight: "bold",
                letterSpacing: 0.3,
                alignSelf: "flex-start",
                maxWidth: "100%",
                minWidth: 0,
                "& .MuiChip-label": {
                  maxWidth: "100%",
                  minWidth: 0,
                  paddingTop: "6px",
                  paddingBottom: "6px",
                },
              }}
            />


            <Typography variant="body2" sx={{ mt: "auto" }}>
              Record: {f.wins}-{f.losses}-{f.draw}
            </Typography>
          </CardContent>
        </Card>
      ))}
    </Box>
  );
}
