import { Box } from "@mui/material";
import StyledSwitch from "./StyledSwitch";
import { useUnit } from "../context/UnitContext";
import euFlag from "../assets/eu.svg";
import usFlag from "../assets/us.svg";

export default function UnitSwitch() {
  const { unit, toggleUnit } = useUnit();

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 0.75,
        px: 0.75,
        py: 0.35,
        borderRadius: 999,
        bgcolor: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      <Box
        component="img"
        src={euFlag}
        alt="EU units"
        sx={{
          width: 20,
          height: 20,
          borderRadius: "50%",
          opacity: unit === "EU" ? 1 : 0.38,
          filter:
            unit === "EU"
              ? "drop-shadow(0 0 4px rgba(255,255,255,0.7))"
              : "none",
          transition: "opacity 180ms ease, filter 180ms ease",
          userSelect: "none",
          pointerEvents: "none",
        }}
      />

      <StyledSwitch checked={unit === "US"} onChange={toggleUnit} />

      <Box
        component="img"
        src={usFlag}
        alt="US units"
        sx={{
          width: 20,
          height: 20,
          borderRadius: "50%",
          opacity: unit === "US" ? 1 : 0.38,
          filter:
            unit === "US"
              ? "drop-shadow(0 0 4px rgba(255,255,255,0.7))"
              : "none",
          transition: "opacity 180ms ease, filter 180ms ease",
          userSelect: "none",
          pointerEvents: "none",
        }}
      />
    </Box>
  );
}