import { Autocomplete, Box, TextField } from "@mui/material";
import { useEffect, useMemo } from "react";
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

  /* X (clear) ikon */
  "& .MuiAutocomplete-clearIndicator": {
    color: "rgba(255,255,255,0.75)",
  },
  "& .MuiAutocomplete-clearIndicator:hover": {
    color: "#fff",
  },

  /* lenyíló nyíl */
  "& .MuiAutocomplete-popupIndicator": {
    color: "rgba(255,255,255,0.75)",
  },
  "& .MuiAutocomplete-popupIndicator:hover": {
    color: "#fff",
  },
};


const inputLabelSx = { color: "rgba(255,255,255,0.75)" };

function divisionIdOf(f: Fighter | null): number | null {
  return f?.division?.id ?? null;
}

export default function ComparePanel({ fighters, left, right, setLeft, setRight }: Props) {
  const leftDivId = divisionIdOf(left);
  const rightDivId = divisionIdOf(right);

  const requiredDivIdForLeft = rightDivId;
  const requiredDivIdForRight = leftDivId;

  const leftOptions = useMemo(() => {
    return fighters
      .filter((f) => (right ? f.id !== right.id : true))
      .filter((f) => (requiredDivIdForLeft ? f.division?.id === requiredDivIdForLeft : true));
  }, [fighters, right, requiredDivIdForLeft]);

  const rightOptions = useMemo(() => {
    return fighters
      .filter((f) => (left ? f.id !== left.id : true))
      .filter((f) => (requiredDivIdForRight ? f.division?.id === requiredDivIdForRight : true));
  }, [fighters, left, requiredDivIdForRight]);

  useEffect(() => {
    if (left && right && left.division?.id !== right.division?.id) {
      setRight(null);
    }
  }, [left, right, setRight]);

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
          onChange={(_, val) => {
            setLeft(val);
            if (val && right && right.division?.id !== val.division?.id) {
              setRight(null);
            }
          }}
          getOptionLabel={(o) => o.name}
          isOptionEqualToValue={(o, v) => o.id === v.id}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Fighter A"
              variant="outlined"
              sx={inputSx}
              slotProps={{
                inputLabel: { sx: inputLabelSx },
              }}
            />
          )}
        />

        <Autocomplete
          options={rightOptions}
          value={right}
          onChange={(_, val) => {
            setRight(val);
            if (val && left && left.division?.id !== val.division?.id) {
              setLeft(null);
            }
          }}
          getOptionLabel={(o) => o.name}
          isOptionEqualToValue={(o, v) => o.id === v.id}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Fighter B"
              variant="outlined"
              sx={inputSx}
              slotProps={{
                inputLabel: { sx: inputLabelSx },
              }}
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
