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
        maxwidth: 1100,
        mx: "auto",
      }}
    >
      <Typography variant="h6" sx={{ fontWeight: 900 }}>
        Tale of the Tape
      </Typography>

      <Divider sx={{ my: 2, borderColor: "rgba(255,255,255,0.10)" }} />

      <StatRow label="Division" left={left?.division.name} right={right?.division.name} />
      <Divider sx={{ borderColor: "rgba(255,255,255,0.06)" }} />

      <StatRow label="Height" left={left?.height} right={right?.height} />
      <StatRow label="Weight" left={left?.weight} right={right?.weight} />
      <StatRow label="Reach" left={left?.reach} right={right?.reach} />
    </Paper>
  );
}
