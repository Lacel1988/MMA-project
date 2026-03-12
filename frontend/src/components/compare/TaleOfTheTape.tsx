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
        py: 1.1,
      }}
    >
      <Box
        sx={{
          display: { xs: "grid", sm: "grid" },
          gridTemplateColumns: { xs: "1fr", sm: "1fr auto 1fr" },
          gap: { xs: 0.5, sm: 2 },
          alignItems: "center",
        }}
      >
        <Typography
          sx={{
            textAlign: { xs: "center", sm: "right" },
            fontWeight: 800,
            wordBreak: "break-word",
          }}
        >
          {left ?? "-"}
        </Typography>

        <Typography
          sx={{
            opacity: 0.75,
            fontWeight: 800,
            fontStyle: "italic",
            textAlign: "center",
            fontSize: { xs: 13, sm: 15 },
            py: { xs: 0.25, sm: 0 },
          }}
        >
          {label}
        </Typography>

        <Typography
          sx={{
            textAlign: { xs: "center", sm: "left" },
            fontWeight: 800,
            wordBreak: "break-word",
          }}
        >
          {right ?? "-"}
        </Typography>
      </Box>
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
        p: { xs: 1.5, sm: 2 },
        color: "white",
        width: "100%",
        maxWidth: 1100,
        mx: "auto",
      }}
    >
      <Typography variant="h6" sx={{ fontWeight: 900, fontSize: { xs: "1.05rem", sm: "1.25rem" } }}>
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
        left={(left as any)?.height_in != null ? formatHeight((left as any).height_in, unit) : "-"}
        right={(right as any)?.height_in != null ? formatHeight((right as any).height_in, unit) : "-"}
      />
      <Divider sx={{ borderColor: "rgba(255,255,255,0.06)" }} />

      <StatRow
        label="Weight"
        left={(left as any)?.weight_lbs != null ? formatWeight((left as any).weight_lbs, unit) : "-"}
        right={(right as any)?.weight_lbs != null ? formatWeight((right as any).weight_lbs, unit) : "-"}
      />
      <Divider sx={{ borderColor: "rgba(255,255,255,0.06)" }} />

      <StatRow
        label="Reach"
        left={(left as any)?.reach_in != null ? formatReach((left as any).reach_in, unit) : "-"}
        right={(right as any)?.reach_in != null ? formatReach((right as any).reach_in, unit) : "-"}
      />
    </Paper>
  );
}