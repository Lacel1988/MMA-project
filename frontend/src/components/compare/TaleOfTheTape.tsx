import { Box, Divider, Paper, Typography } from "@mui/material";
import type { Fighter } from "../../types";

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

function formatHeight(inches?: number | null) {
  if (inches == null) return "-";
  const v = Math.round(Number(inches));
  if (!Number.isFinite(v) || v <= 0) return "-";
  const ft = Math.floor(v / 12);
  const inch = v % 12;
  return `${ft}'${inch}"`;
}

function formatWeight(lbs?: number | null) {
  if (lbs == null) return "-";
  const v = Number(lbs);
  if (!Number.isFinite(v) || v <= 0) return "-";
  // ha integer, ne írjunk .00-t
  const pretty = Number.isInteger(v) ? String(v) : v.toFixed(1);
  return `${pretty} lbs`;
}

function formatReach(inches?: number | null) {
  if (inches == null) return "-";
  const v = Math.round(Number(inches));
  if (!Number.isFinite(v) || v <= 0) return "-";
  return `${v}"`;
}

export default function TaleOfTheTape({
  left,
  right,
}: {
  left: Fighter | null;
  right: Fighter | null;
}) {
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
        maxWidth: 1100, // <-- maxwidth helyett maxWidth
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
        left={formatHeight((left as any)?.height_in)}
        right={formatHeight((right as any)?.height_in)}
      />
      <StatRow
        label="Weight"
        left={formatWeight((left as any)?.weight_lbs)}
        right={formatWeight((right as any)?.weight_lbs)}
      />
      <StatRow
        label="Reach"
        left={formatReach((left as any)?.reach_in)}
        right={formatReach((right as any)?.reach_in)}
      />
    </Paper>
  );
}