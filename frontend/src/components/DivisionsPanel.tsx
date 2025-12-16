import { Box, Chip, Typography } from "@mui/material";

type Division = {
  id: number;
  name: string;
};

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
}) {
  const { fighters, aktivDivisionId, setAktivDivisionId } = props;

  const divisions = Array.from(
    new Map(fighters.map((f) => [f.division.id, f.division])).values()
  ).sort((a, b) => a.name.localeCompare(b.name));

  return (
    <Box sx={{ mb: 2 }}>
      <Typography sx={{ color: "white", mb: 1, opacity: 0.85 }}>
        Divisions
      </Typography>

      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
        <Chip
          label="All"
          clickable
          onClick={() => setAktivDivisionId(null)}
          sx={{
            bgcolor: aktivDivisionId === null ? "#b71c1c" : "rgba(255,255,255,0.08)",
            color: "#fff",
            fontWeight: 700,
          }}
        />

        {divisions.map((d) => {
          const aktiv = aktivDivisionId === d.id;

          return (
            <Chip
              key={d.id}
              label={d.name}
              clickable
              onClick={() => setAktivDivisionId(d.id)}
              sx={{
                bgcolor: aktiv ? "#b71c1c" : "rgba(255,255,255,0.08)",
                color: "#fff",
                fontWeight: aktiv ? 800 : 600,
              }}
            />
          );
        })}
      </Box>
    </Box>
  );
}
