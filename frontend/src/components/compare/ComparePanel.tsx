import { Autocomplete, Box, TextField } from "@mui/material";
import type { Fighter } from "../../types";
import FighterCompareCard from "./FighterCompareCard";
import TaleOfTheTape from "./TaleOfTheTape";

type Props = {
  fighters: Fighter[];
  left: Fighter | null;
  right: Fighter | null;
  setLeft: (f: Fighter | null) => void;
  setRight: (f: Fighter | null) => void;
};

const inputSx = {
  "& .MuiOutlinedInput-root": {
    color: "white",
    bgcolor: "rgba(255,255,255,0.04)",
  },
  "& .MuiOutlinedInput-notchedOutline": {
    borderColor: "rgba(255,255,255,0.18)",
  },
};

const labelSx = { sx: { color: "rgba(255,255,255,0.75)" } };

export default function ComparePanel({ fighters, left, right, setLeft, setRight }: Props) {
  const leftOptions = fighters.filter((f) => (right ? f.id !== right.id : true));
  const rightOptions = fighters.filter((f) => (left ? f.id !== left.id : true));

  return (
    <Box sx={{ display: "grid", gap: 3 }}>
      <Box
        sx={{
          display: "grid",
          gap: 2,
          gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
        }}
      >
        <Autocomplete
          options={leftOptions}
          value={left}
          onChange={(_, val) => setLeft(val)}
          getOptionLabel={(o) => o.name}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Fighter A"
              variant="outlined"
              InputLabelProps={labelSx}
              sx={inputSx}
            />
          )}
        />

        <Autocomplete
          options={rightOptions}
          value={right}
          onChange={(_, val) => setRight(val)}
          getOptionLabel={(o) => o.name}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Fighter B"
              variant="outlined"
              InputLabelProps={labelSx}
              sx={inputSx}
            />
          )}
        />
      </Box>

      <Box
        sx={{
          display: "grid",
          gap: 3,
          gridTemplateColumns: { xs: "1fr", lg: "1fr 1fr" },
        }}
      >
        <FighterCompareCard fighter={left} title="Fighter A" />
        <FighterCompareCard fighter={right} title="Fighter B" />
      </Box>

      <TaleOfTheTape left={left} right={right} />
    </Box>
  );
}
