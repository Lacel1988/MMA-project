import { styled } from "@mui/material/styles";
import Switch, { type SwitchProps } from "@mui/material/Switch";

const StyledSwitch = styled((props: SwitchProps) => (
  <Switch
    focusVisibleClassName="Mui-focusVisible"
    disableRipple
    {...props}
  />
))(({ theme }) => ({
  width: 54,
  height: 30,
  padding: 4,
  display: "flex",
  alignItems: "center",

  "& .MuiSwitch-switchBase": {
    padding: 0,
    margin: 1,
    transitionDuration: "220ms",

    "&.Mui-checked": {
      transform: "translateX(24px)",
      color: "#fff",

      "& + .MuiSwitch-track": {
        backgroundColor: "rgba(183, 28, 28, 0.34)",
        borderColor: "rgba(255,255,255,0.15)",
        opacity: 1,
      },

      "& .MuiSwitch-thumb": {
        backgroundColor: "#c62828",
      },
    },

    "&.Mui-focusVisible .MuiSwitch-thumb": {
      boxShadow: "0 0 0 5px rgba(183, 28, 28, 0.22)",
    },
  },

  "& .MuiSwitch-thumb": {
    boxSizing: "border-box",
    width: 25,
    height: 25,
    borderRadius: "50%",
    backgroundColor: "#111",
    border: "2px solid rgba(255,255,255,0.16)",
    boxShadow: "0 2px 6px rgba(0,0,0,0.42)",
  },

  "& .MuiSwitch-track": {
    borderRadius: 999,
    opacity: 1,
    backgroundColor: "rgba(255,255,255,0.08)",
    border: "1px solid rgba(255,255,255,0.10)",
    boxSizing: "border-box",
    transition: theme.transitions.create(["background-color", "border-color"], {
      duration: 220,
    }),
  },
}));

export default StyledSwitch;