import { Autocomplete, Box, TextField } from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import type { Fighter } from "../../types";
import FighterCompareCard from "./FighterCompareCard";
import TaleOfTheTape from "./TaleOfTheTape";
import UfcRadarChart from "./UfcRadarChart";

type Metrics = {
  sig_str_acc_pct: number;
  td_acc_pct: number;
  kd_per15: number;
  sub_att_per15: number;
  ctrl_sec_per15: number;
};

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

  "& .MuiAutocomplete-clearIndicator": {
    color: "rgba(255,255,255,0.75)",
  },
  "& .MuiAutocomplete-clearIndicator:hover": {
    color: "#fff",
  },

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

export default function ComparePanel({
  fighters,
  left,
  right,
  setLeft,
  setRight,
}: Props) {
  const leftDivId = divisionIdOf(left);
  const rightDivId = divisionIdOf(right);

  const requiredDivIdForLeft = rightDivId;
  const requiredDivIdForRight = leftDivId;

  const leftOptions = useMemo(() => {
    return fighters
      .filter((f) => (right ? f.id !== right.id : true))
      .filter((f) =>
        requiredDivIdForLeft ? f.division?.id === requiredDivIdForLeft : true
      );
  }, [fighters, right, requiredDivIdForLeft]);

  const rightOptions = useMemo(() => {
    return fighters
      .filter((f) => (left ? f.id !== left.id : true))
      .filter((f) =>
        requiredDivIdForRight ? f.division?.id === requiredDivIdForRight : true
      );
  }, [fighters, left, requiredDivIdForRight]);

  useEffect(() => {
    if (left && right && left.division?.id !== right.division?.id) {
      setRight(null);
    }
  }, [left, right, setRight]);

  const [leftRadar, setLeftRadar] = useState<Metrics | null>(null);
  const [rightRadar, setRightRadar] = useState<Metrics | null>(null);

  useEffect(() => {
    async function load() {
      if (!left) {
        setLeftRadar(null);
        return;
      }
      const res = await fetch(
        `http://127.0.0.1:8000/api/ufc/radar/?fighter=${encodeURIComponent(
          left.name
        )}&last=5`
      );
      const data = await res.json();
      setLeftRadar(data.metrics ?? null);
    }
    load();
  }, [left]);

  useEffect(() => {
    async function load() {
      if (!right) {
        setRightRadar(null);
        return;
      }
      const res = await fetch(
        `http://127.0.0.1:8000/api/ufc/radar/?fighter=${encodeURIComponent(
          right.name
        )}&last=5`
      );
      const data = await res.json();
      setRightRadar(data.metrics ?? null);
    }
    load();
  }, [right]);

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        width: "100%",
      }}
    >
      <Box
        sx={{
          width: "100%",
          maxWidth: 1100,
          display: "grid",
          gap: 3,
        }}
      >
        {/* SELECTORS */}
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
                slotProps={{ inputLabel: { sx: inputLabelSx } }}
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
                slotProps={{ inputLabel: { sx: inputLabelSx } }}
              />
            )}
          />
        </Box>

        {/* CARDS */}
        <Box
          sx={{
            display: "grid",
            gap: 3,
            gridTemplateColumns: { xs: "1fr", lg: "1fr 1fr" },
            "& > *": { minWidth: 0 },
          }}
        >
          <FighterCompareCard fighter={left} title="Fighter A" />
          <FighterCompareCard fighter={right} title="Fighter B" />
        </Box>

        {/* RADAR CHARTS */}
        <Box
          sx={{
            display: "grid",
            gap: 3,
            gridTemplateColumns: { xs: "1fr", lg: "1fr 1fr" },
            "& > *": { minWidth: 0 },
          }}
        >
          <UfcRadarChart
            title="Fighter A"
            fighterName={left?.name ?? "Fighter A"}
            metrics={leftRadar}
            last={5}
            color="#b71c1c"
          />

          <UfcRadarChart
            title="Fighter B"
            fighterName={right?.name ?? "Fighter B"}
            metrics={rightRadar}
            last={5}
            color="#1976d2"
          />
        </Box>

        {/* TALE OF THE TAPE */}
        <TaleOfTheTape left={left} right={right} />
      </Box>
    </Box>
  );
}
