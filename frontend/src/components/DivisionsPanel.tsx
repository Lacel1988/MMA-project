import { Box, Button, Typography } from "@mui/material";

type Division = { id: number; name: string };

type Fighter = {
  id: number;
  name: string;
  wins: number;
  losses: number;
  draw: number;
  division: Division;
  upload_image?: string | null;
};

export default function DivisionsPanel(props: {
  fighters: Fighter[];
  aktivDivisionId: number | null;
  setAktivDivisionId: (id: number | null) => void;
  variant?: "dark" | "light";
}) {
  const { fighters, aktivDivisionId, setAktivDivisionId, variant = "dark" } = props;

  const divisions = Array.from(
    new Map(fighters.map((f) => [f.division.id, f.division])).values()
  ).sort((a, b) => a.name.localeCompare(b.name));

  const titleColor = variant === "light" ? "#111" : "#fff";
  const offBg = variant === "light" ? "rgba(0,0,0,0.06)" : "rgba(255,255,255,0.08)";
  const offText = variant === "light" ? "#111" : "#fff";

  const gombSx = (aktiv: boolean) => ({
    justifyContent: "flex-start",
    textTransform: "none",
    fontWeight: aktiv ? 900 : 700,
    borderRadius: 2,
    px: 1.25,
    py: 0.9,
    bgcolor: aktiv ? "#b71c1c" : offBg,
    color: aktiv ? "#fff" : offText,
    "&:hover": {
      bgcolor: aktiv
        ? "#c62828"
        : variant === "light"
        ? "rgba(0,0,0,0.10)"
        : "rgba(255,255,255,0.14)",
    },
  });

  return (
    <Box sx={{ display: "grid", gap: 1.25 }}>
      <Typography sx={{ color: titleColor, opacity: 0.9, fontWeight: 900 }}>
        Divisions
      </Typography>

      <Box sx={{ display: "grid", gap: 1 }}>
        <Button onClick={() => setAktivDivisionId(null)} sx={gombSx(aktivDivisionId === null)}>
          All
        </Button>

        {divisions.map((d) => (
          <Button
            key={d.id}
            onClick={() => setAktivDivisionId(d.id)}
            sx={gombSx(aktivDivisionId === d.id)}
          >
            {d.name}
          </Button>
        ))}
      </Box>
    </Box>
  );
}