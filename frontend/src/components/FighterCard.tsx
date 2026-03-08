import { memo } from "react";
import { Box, Card, Chip, Typography } from "@mui/material";
import type { Fighter } from "../types";
import { getFighterImageUrl } from "../utils/fighterImage";
import { useUnit } from "../context/UnitContext";

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

function safeNumber(value?: number | null) {
  const v = Number(value);
  return Number.isFinite(v) && v > 0 ? v : null;
}

function safeStatNumber(value?: number | null) {
  const v = Number(value);
  return Number.isFinite(v) && v >= 0 ? v : 0;
}

function formatHeight(valueInInches?: number | null, unit: "US" | "EU" = "US") {
  const inches = safeNumber(valueInInches);
  if (inches == null) return "-";

  if (unit === "US") {
    const rounded = Math.round(inches);
    const ft = Math.floor(rounded / 12);
    const inch = rounded % 12;
    return `${ft}'${inch}"`;
  }

  const cm = Math.round(inches * 2.54);
  return `${cm} cm`;
}

function formatWeight(valueInLbs?: number | null, unit: "US" | "EU" = "US") {
  const lbs = safeNumber(valueInLbs);
  if (lbs == null) return "-";

  if (unit === "US") {
    const pretty = Number.isInteger(lbs) ? String(lbs) : lbs.toFixed(1);
    return `${pretty} lbs`;
  }

  const kg = lbs * 0.45359237;
  return `${kg.toFixed(1)} kg`;
}

function formatReach(valueInInches?: number | null, unit: "US" | "EU" = "US") {
  const inches = safeNumber(valueInInches);
  if (inches == null) return "-";

  if (unit === "US") {
    return `${Math.round(inches)}"`;
  }

  const cm = Math.round(inches * 2.54);
  return `${cm} cm`;
}

function StatBox({ label, value }: { label: string; value: string | number }) {
  return (
    <Box
      sx={{
        minWidth: 0,
        px: { xs: 0.7, sm: 0.9, md: 1.1 },
        py: { xs: 0.7, sm: 0.85, md: 0.95 },
        borderRadius: 2,
        bgcolor: "rgba(255,255,255,0.05)",
        border: "1px solid rgba(255,255,255,0.08)",
        textAlign: "center",
      }}
    >
      <Typography
        sx={{
          fontSize: { xs: 9, sm: 10 },
          lineHeight: 1.05,
          letterSpacing: { xs: 0.4, sm: 0.7 },
          textTransform: "uppercase",
          color: "rgba(255,255,255,0.5)",
          mb: 0.4,
          fontWeight: 800,
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        {label}
      </Typography>

      <Typography
        sx={{
          fontSize: { xs: 11, sm: 12, md: 13 },
          lineHeight: 1.15,
          color: "rgba(255,255,255,0.92)",
          fontWeight: 700,
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        {value}
      </Typography>
    </Box>
  );
}

function FighterCardInner({ fighter, selected, onClick }: Props) {
  const f: any = fighter;
  const img = getFighterImageUrl(f);
  const { unit } = useUnit();

  const divisionName = getDivisionName(f);

  const wins = safeStatNumber(f?.wins);
  const losses = safeStatNumber(f?.losses);
  const draws = safeStatNumber(f?.draw);

  const heightText = formatHeight(f?.height_in, unit);
  const weightText = formatWeight(f?.weight_lbs, unit);
  const reachText = formatReach(f?.reach_in, unit);

  return (
    <Card
      onClick={onClick}
      sx={{
        position: "relative",
        cursor: "pointer",
        borderRadius: 5,
        overflow: "hidden",
        bgcolor: "rgba(12,12,12,0.92)",
        border: "1px solid rgba(255,255,255,0.08)",
        transition: "transform 120ms ease",
        "&:hover": { transform: "translateY(-1px)" },
        userSelect: "none",
        height: "100%",
        width: "100%",
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        "&::after": selected
          ? {
              content: '""',
              position: "absolute",
              inset: 0,
              borderRadius: "inherit",
              border: "2px solid rgba(183,28,28,0.92)",
              pointerEvents: "none",
            }
          : undefined,
      }}
    >
      <Box
        sx={{
          position: "relative",
          width: "100%",
          aspectRatio: "3 / 1",
          bgcolor: "#0b0b0b",
          overflow: "hidden",
          flexShrink: 0,
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

      <Box
        sx={{
          p: { xs: 1.3, sm: 1.6, md: 2 },
          display: "flex",
          flexDirection: "column",
          gap: 1,
          minHeight: 190,
        }}
      >
        <Typography
          sx={{
            fontFamily: "var(--mma-title-font)",
            fontWeight: 900,
            fontSize: { xs: 18, sm: 19, md: 20 },
            lineHeight: 1.05,
            color: "rgba(255,255,255,0.92)",
            minHeight: 42,
            textAlign: "center",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {fighter.name}
        </Typography>

        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            px: 0.5,
          }}
        >
          <Chip
            label={divisionName}
            size="small"
            sx={{
              maxWidth: "100%",
              bgcolor: "#b71c1c",
              color: "white",
              fontWeight: 900,
              borderRadius: 2,
              "& .MuiChip-label": {
                display: "block",
                px: 1.2,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                fontSize: { xs: 12, sm: 13 },
              },
            }}
          />
        </Box>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
            gap: { xs: 0.7, sm: 0.85, md: 1 },
          }}
        >
          <StatBox label="Win" value={wins} />
          <StatBox label="Loss" value={losses} />
          <StatBox label="Draw" value={draws} />
        </Box>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
            gap: { xs: 0.7, sm: 0.85, md: 1 },
          }}
        >
          <StatBox label="Weight" value={weightText} />
          <StatBox label="Height" value={heightText} />
          <StatBox label="Reach" value={reachText} />
        </Box>
      </Box>
    </Card>
  );
}

const FighterCard = memo(FighterCardInner);
export default FighterCard;