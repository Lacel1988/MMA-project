
import React from "react";
import StyledSwitch from "./StyledSwitch";
import { useUnit } from "../context/UnitContext";

export default function UnitSwitch() {
  const { unit, toggleUnit } = useUnit();

  return (
    <StyledSwitch 
      checked={unit === "US"} 
      onChange={toggleUnit}
    />
  );
}
