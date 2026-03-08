import { Box, Divider, Paper, Typography } from "@mui/material";
import type { Fighter } from "../../types";
import { useUnit } from "../../context/UnitContext";

function StatRow({
  label,
  left,
  right,
}: {
  label: string;
  left: string | number | null | undefined;
  right: string | number | null | undefined;
}) {
  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: "1fr auto 1fr",
        gap: 2,
        alignItems: "center",
        py: 1.1,
      }}
    >
      <Typography sx={{ textAlign: "right", fontWeight: 800 }}>
        {left ?? "-"}
      </Typography>

      <Typography sx={{ opacity: 0.75, fontWeight: 800, fontStyle: "italic" }}>
        {label}
      </Typography>

      <Typography sx={{ textAlign: "left", fontWeight: 800 }}>
        {right ?? "-"}
      </Typography>
    </Box>
  );
}

function safeNumber(value?: number | null) {
  const v = Number(value);
  return Number.isFinite(v) && v > 0 ? v : null;
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

export default function TaleOfTheTape({
  left,
  right,
}: {
  left: Fighter | null;
  right: Fighter | null;
}) {
  const { unit } = useUnit();

  return (
    <Paper
      elevation={0}
      sx={{
        bgcolor: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 3,
        p: 2,
        color: "white",
        width: "100%",
        maxWidth: 1100,
        mx: "auto",
      }}
    >
      <Typography variant="h6" sx={{ fontWeight: 900 }}>
        Tale of the Tape
      </Typography>

      <Divider sx={{ my: 2, borderColor: "rgba(255,255,255,0.10)" }} />

      <StatRow
        label="Division"
        left={left?.division?.name}
        right={right?.division?.name}
      />
      <Divider sx={{ borderColor: "rgba(255,255,255,0.06)" }} />

      <StatRow
        label="Height"
        left={formatHeight((left as any)?.height_in, unit)}
        right={formatHeight((right as any)?.height_in, unit)}
      />
      <StatRow
        label="Weight"
        left={formatWeight((left as any)?.weight_lbs, unit)}
        right={formatWeight((right as any)?.weight_lbs, unit)}
      />
      <StatRow
        label="Reach"
        left={formatReach((left as any)?.reach_in, unit)}
        right={formatReach((right as any)?.reach_in, unit)}
      />
    </Paper>
  );
}