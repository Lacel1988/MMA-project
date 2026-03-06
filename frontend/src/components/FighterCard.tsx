import { memo } from "react";
import { Box, Card, Chip, Typography } from "@mui/material";
import type { Fighter } from "../types";
import { getFighterImageUrl } from "../utils/fighterImage";

type Props = {
  fighter: Fighter;
  selected?: boolean;
  onClick?: () => void;
};

function getDivisionName(f: any): string {
  const d = f?.division;
  if (!d) return "-";
  if (typeof d === "string") return d;
  if (typeof d?.name === "string") return d.name;
  return "-";
}

function getRecordText(f: any): string {
  const w = Number.isFinite(f?.wins) ? f.wins : 0;
  const l = Number.isFinite(f?.losses) ? f.losses : 0;
  const d = Number.isFinite(f?.draw) ? f.draw : 0;
  return `${w}-${l}-${d}`;
}

function FighterCardInner({ fighter, selected, onClick }: Props) {
  const f: any = fighter;
  const img = getFighterImageUrl(f);

  const divisionName = getDivisionName(f);
  const record = getRecordText(f);

  return (
    <Card
      onClick={onClick}
      sx={{
        cursor: "pointer",
        borderRadius: 5,
        overflow: "hidden",
        bgcolor: "rgba(12,12,12,0.92)",
        border: selected
          ? "3px solid rgba(183,28,28,0.85)"
          : "1px solid rgba(255,255,255,0.08)",
        boxShadow: selected ? "0 0 0 1px rgba(183,28,28,0.25)" : "none",
        transition: "transform 120ms ease",
        "&:hover": { transform: "translateY(-1px)" },
        userSelect: "none",
      }}
    >
      <Box
        sx={{
          position: "relative",
          width: "100%",
          aspectRatio: "3 / 1",
          bgcolor: "#0b0b0b",
          overflow: "hidden",
        }}
      >
        {img ? (
          <>
            <Box
              component="img"
              src={img}
              alt=""
              loading="lazy"
              draggable={false}
              sx={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                objectFit: "cover",
                filter: "blur(18px)",
                transform: "scale(1.08)",
                opacity: 0.55,
              }}
            />

            <Box
              sx={{
                position: "absolute",
                inset: 0,
                background:
                  "radial-gradient(ellipse at center, rgba(0,0,0,0.10) 0%, rgba(0,0,0,0.65) 70%, rgba(0,0,0,0.85) 100%)",
              }}
            />

            <Box
              component="img"
              src={img}
              alt={fighter.name}
              loading="lazy"
              draggable={false}
              sx={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                objectFit: "contain",
                objectPosition: "center 15%",
                filter: "drop-shadow(0 14px 18px rgba(0,0,0,0.55))",
              }}
            />
          </>
        ) : (
          <Box
            sx={{
              position: "absolute",
              inset: 0,
              display: "grid",
              placeItems: "center",
              color: "rgba(255,255,255,0.55)",
              fontSize: 14,
            }}
          >
            No image
          </Box>
        )}
      </Box>

      <Box sx={{ p: 2 }}>
        <Typography
          sx={{
            fontFamily: "var(--mma-title-font)",
            fontWeight: 900,
            fontSize: 20,
            color: "rgba(255,255,255,0.92)",
            mb: 1,
          }}
        >
          {fighter.name}
        </Typography>

        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
          <Chip
            label={divisionName}
            size="small"
            sx={{
              bgcolor: "#b71c1c",
              color: "white",
              fontWeight: 900,
              borderRadius: 2,
            }}
          />

          <Chip
            label={`Record: ${record}`}
            size="small"
            sx={{
              bgcolor: "rgba(255,255,255,0.08)",
              color: "rgba(255,255,255,0.85)",
              border: "1px solid rgba(255,255,255,0.10)",
            }}
          />
        </Box>
      </Box>
    </Card>
  );
}

const FighterCard = memo(FighterCardInner);
export default FighterCard;