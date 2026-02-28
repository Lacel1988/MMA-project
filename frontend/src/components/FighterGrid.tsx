import UnitSwitch from "../components/UnitSwitch";
import { Card, CardContent, Chip, Box, Typography } from "@mui/material";
import type { Fighter } from "../types";

type Props = {
  fighters: Fighter[];
  onSelect: (f: Fighter) => void;
  selectedId: number | null;
  animKey?: string | number;
};

function seeded01(seed: number) {
  // determinisztikus 0..1
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

function pickFromOffset(seed: number) {
  // 4 irány + kicsit változó erő
  const r = seeded01(seed);
  const mag = 12 + Math.floor(seeded01(seed + 7) * 22); // 12..34 px
  if (r < 0.25) return { x: -mag, y: 0 }; // balról
  if (r < 0.5) return { x: mag, y: 0 }; // jobbról
  if (r < 0.75) return { x: 0, y: -mag }; // fentről
  return { x: 0, y: mag }; // lentről
}

export default function FighterGrid({ fighters, onSelect, selectedId, animKey }: Props) {
  return (
    <Box key={animKey}>
      <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
        <UnitSwitch />
      </Box>

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
        {fighters.map((f) => {
          const seed = (f.id ?? 1) * 1337;
          const { x, y } = pickFromOffset(seed);
          const delay = 30 + Math.floor(seeded01(seed + 3) * 160); // 30..190ms
          const dur = 220 + Math.floor(seeded01(seed + 11) * 180); // 220..400ms

          return (
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

                // --- belépő anim (filter/search után)
                opacity: 0,
                transform: `translate(${x}px, ${y}px) scale(0.985)`,
                animation: `mmaCardIn ${dur}ms ease-out forwards`,
                animationDelay: `${delay}ms`,
                willChange: "transform, opacity",
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
                        whiteSpace: "nowrap",
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
          );
        })}
      </Box>
    </Box>
  );
}