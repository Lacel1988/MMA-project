import { Box, IconButton } from "@mui/material";
import TuneIcon from "@mui/icons-material/Tune";
import CloseIcon from "@mui/icons-material/Close";

export default function FilterSidebar(props: {
  children: React.ReactNode;
  navbarHeight?: number;
  open: boolean;
  setOpen: (v: boolean) => void;
  collapsedWidth?: number;
  expandedWidth?: number;
}) {
  const {
    children,
    navbarHeight = 64,
    open,
    setOpen,
    collapsedWidth = 48,
    expandedWidth = 280,
  } = props;

  return (
    <Box
      sx={{
        position: "sticky",
        top: navbarHeight + 12,
        alignSelf: "start",
        zIndex: 5,
        width: open ? expandedWidth : collapsedWidth,
        transition: "width 180ms ease",
        bgcolor: open ? "#fff" : "transparent",
        borderRadius: 2,
        border: open ? "1px solid rgba(0,0,0,0.10)" : "none",
        overflow: "hidden",
      }}
    >
      {/* Toggle fül */}
      <Box
        sx={{
          height: collapsedWidth,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: open ? "#fff" : "rgba(255,255,255,0.08)",
          borderRight: open ? "1px solid rgba(0,0,0,0.10)" : "none",
        }}
      >
        <IconButton
          onClick={() => setOpen(!open)}
          size="small"
          sx={{ color: open ? "#111" : "#fff" }}
        >
          {open ? <CloseIcon /> : <TuneIcon />}
        </IconButton>
      </Box>

      {/* Tartalom */}
      <Box sx={{ display: open ? "block" : "none", p: 2, color: "#111" }}>
        {children}
      </Box>
    </Box>
  );
}