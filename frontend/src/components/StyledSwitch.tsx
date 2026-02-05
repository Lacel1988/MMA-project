import React from "react";
import { styled } from "@mui/material/styles";
import Switch, { SwitchProps } from "@mui/material/Switch";

import euFlagUrl from "./assets/eu.svg";
import usFlagUrl from "./assets/us.svg";

type FlagSwitchProps = Omit<SwitchProps, "icon" | "checkedIcon">;

const StyledSwitch = styled((props: FlagSwitchProps) => (
  <Switch
    focusVisibleClassName=".Mui-focusVisible"
    disableRipple
    {...props}
  />
))(({ theme }) => ({
  width: 62,
  height: 34,
  padding: 7,
  "& .MuiSwitch-switchBase": {
    padding: 0,
    margin: 1,
    transition: theme.transitions.create(["transform"], {
      duration: theme.transitions.duration.shortest,
    }),
    "&.Mui-checked": {
      transform: "translateX(28px)",
      "& .MuiSwitch-thumb": {
        backgroundImage: `url(${usFlagUrl})`,
      },
    },
  },
  "& .MuiSwitch-thumb": {
    width: 30,
    height: 30,
    borderRadius: "50%",
    backgroundColor: "#2b2b2b",
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundImage: `url(${euFlagUrl})`,
    boxShadow: "0 2px 6px rgba(0,0,0,0.5)",
  },
  "& .MuiSwitch-track": {
    borderRadius: 34 / 2,
    opacity: 1,
    backgroundColor: "#3a3a3a",
    boxShadow: "inset 0 0 6px rgba(0,0,0,0.6)",
  },
}));

export default StyledSwitch;
