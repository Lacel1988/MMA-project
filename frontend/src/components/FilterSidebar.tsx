import {
  Box,
  Drawer,
  IconButton,
  Typography,
  TextField,
  List,
  ListItemButton,
  ListItemText,
  Divider,
  Button,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

type Division = {
  id: number;
  name: string;
};

type Props = {
  open: boolean;
  onClose: () => void;

  divisions: Division[];

  aktivDivisionId: number | null;
  setAktivDivisionId: (id: number | null) => void;

  search: string;
  setSearch: (v: string) => void;

  title?: string;
  navHeight?: number;

  // Desktopon "persistent" (tolja a layoutot), mobilon "temporary" (rányílik)
  variant?: "persistent" | "temporary";
};

export default function FilterSidebar({
  open,
  onClose,
  divisions,
  aktivDivisionId,
  setAktivDivisionId,
  search,
  setSearch,
  title = "Division filter",
  navHeight = 64,
  variant = "temporary",
}: Props) {
  const drawerWidth = 360;

  return (
    <Drawer
      anchor="left"
      open={open}
      onClose={onClose}
      variant={variant}
      ModalProps={{
        keepMounted: true,
        // FONTOS: ne lockolja az egész oldalt scrollban
        disableScrollLock: true,
      }}
      // temporary-nél se sötétítsen
      hideBackdrop={variant === "temporary"}
      PaperProps={{
        sx: {
          width: { xs: "86vw", sm: drawerWidth },
          maxWidth: 420,
          bgcolor: "#ffffff",
          color: "#111",
          borderRight: "1px solid rgba(0,0,0,0.10)",
          overflow: "hidden",
        },
      }}
    >
      <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
        <Box
          sx={{
            position: "sticky",
            top: 0,
            zIndex: 1,
            px: 2,
            py: 1.5,
            bgcolor: "#ffffff",
            borderBottom: "1px solid rgba(0,0,0,0.10)",
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}
        >
          <Typography
            sx={{
              fontWeight: 900,
              letterSpacing: 0.6,
              fontFamily: "var(--mma-title-font)",
            }}
          >
            {title}
          </Typography>

          <Box sx={{ flexGrow: 1 }} />

          <IconButton onClick={onClose} sx={{ color: "#111" }}>
            <CloseIcon />
          </IconButton>
        </Box>

        <Box
          sx={{
            px: 2,
            py: 2,
            overflowY: "auto",
            // ez a filter saját scrollja
            maxHeight: `calc(100vh - ${navHeight}px)`,
          }}
        >
          <Typography
            sx={{
              fontSize: 13,
              opacity: 0.75,
              mb: 1,
              fontFamily: "var(--mma-title-font)",
            }}
          >
            Search
          </Typography>

          <TextField
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Type fighter name..."
            size="small"
            fullWidth
            InputProps={{
              sx: {
                bgcolor: "rgba(0,0,0,0.06)",
                color: "#111",
                borderRadius: 2,
                fontFamily: "var(--mma-body-font)",
              },
            }}
            sx={{
              "& .MuiOutlinedInput-notchedOutline": {
                borderColor: "rgba(0,0,0,0.20)",
              },
              "&:hover .MuiOutlinedInput-notchedOutline": {
                borderColor: "rgba(0,0,0,0.35)",
              },
              "& .Mui-focused .MuiOutlinedInput-notchedOutline": {
                borderColor: "rgba(183,28,28,0.75)",
              },
            }}
          />

          <Box sx={{ display: "flex", gap: 1, mt: 1.25 }}>
            <Button
              onClick={() => {
                setSearch("");
                setAktivDivisionId(null);
              }}
              variant="contained"
              sx={{
                textTransform: "none",
                fontWeight: 900,
                bgcolor: "#b71c1c",
                "&:hover": { bgcolor: "#c62828" },
              }}
            >
              Reset
            </Button>
          </Box>

          <Divider sx={{ my: 2, borderColor: "rgba(0,0,0,0.12)" }} />

          <Typography
            sx={{
              fontSize: 13,
              opacity: 0.75,
              mb: 1,
              fontFamily: "var(--mma-title-font)",
            }}
          >
            Divisions
          </Typography>

          <List dense sx={{ p: 0 }}>
            <ListItemButton
              onClick={() => setAktivDivisionId(null)}
              sx={{
                borderRadius: 2,
                mb: 0.5,
                bgcolor: aktivDivisionId === null ? "rgba(183,28,28,0.10)" : "transparent",
                border:
                  aktivDivisionId === null
                    ? "1px solid rgba(183,28,28,0.35)"
                    : "1px solid rgba(0,0,0,0.10)",
                "&:hover": { bgcolor: "rgba(0,0,0,0.06)" },
              }}
            >
              <ListItemText
                primary="All"
                primaryTypographyProps={{
                  sx: { fontWeight: 900, fontFamily: "var(--mma-title-font)" },
                }}
              />
            </ListItemButton>

            {divisions.map((d) => {
              const aktiv = aktivDivisionId === d.id;

              return (
                <ListItemButton
                  key={d.id}
                  onClick={() => setAktivDivisionId(d.id)}
                  sx={{
                    borderRadius: 2,
                    mb: 0.5,
                    bgcolor: aktiv ? "rgba(183,28,28,0.10)" : "transparent",
                    border: aktiv ? "1px solid rgba(183,28,28,0.35)" : "1px solid rgba(0,0,0,0.10)",
                    "&:hover": { bgcolor: "rgba(0,0,0,0.06)" },
                  }}
                >
                  <ListItemText
                    primary={d.name}
                    primaryTypographyProps={{
                      sx: { fontWeight: aktiv ? 950 : 800, fontFamily: "var(--mma-title-font)" },
                    }}
                  />
                </ListItemButton>
              );
            })}
          </List>

          <Box sx={{ height: 12 }} />
        </Box>
      </Box>
    </Drawer>
  );
}