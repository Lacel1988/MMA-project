import { AppBar, Toolbar, Typography, Button, Box, Chip, Container } from "@mui/material";
import type { MeResponse } from "../api/authApi";

type Ful = "Fighters" | "Details" | "Compare" | "Auth";

export default function Navbar({
  aktivFül,
  setAktivFül,
  user,
  onLogout,
  height = 64,
}: {
  aktivFül: Ful;
  setAktivFül: (f: Ful) => void;
  user: MeResponse | null;
  onLogout: () => void;
  height?: number;
}) {
  const gomb = (felirat: Ful) => (
    <Button
      key={felirat}
      onClick={() => setAktivFül(felirat)}
      sx={{
        textTransform: "none",
        fontWeight: 800,
        fontStyle: "italic",
        borderRadius: 2,
        px: 2,
        py: 1,
        color: aktivFül === felirat ? "#fff" : "rgba(255,255,255,0.85)",
        bgcolor: aktivFül === felirat ? "#b71c1c" : "rgba(255,255,255,0.06)",
        boxShadow:
          aktivFül === felirat
            ? "inset 0 0 0 2px rgba(255,255,255,0.35)"
            : "none",
        "&:hover": {
          bgcolor: aktivFül === felirat ? "#c62828" : "rgba(255,255,255,0.12)",
        },
      }}
    >
      {felirat}
    </Button>
  );

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        bgcolor: "#0b0b0b",
        borderBottom: "1px solid rgba(255,255,255,0.08)",
        backdropFilter: "blur(8px)",
      }}
    >
      <Toolbar sx={{ minHeight: height }}>
        <Container
          maxWidth="lg"
          sx={{
            px: { xs: 1.5, md: 2 },
            display: "flex",
            alignItems: "center",
            gap: 2,
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 900, letterSpacing: 1 }}>
            MMA <span style={{ color: "#b71c1c" }}>PROJECT</span>
          </Typography>

          <Box sx={{ flexGrow: 1 }} />

          {user ? (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Chip
                label={`Hi, ${user.username}`}
                sx={{ bgcolor: "rgba(255,255,255,0.08)", color: "white" }}
              />
              <Button
                onClick={onLogout}
                sx={{
                  textTransform: "none",
                  fontWeight: 900,
                  borderRadius: 2,
                  color: "white",
                  bgcolor: "rgba(255,255,255,0.06)",
                  "&:hover": { bgcolor: "rgba(255,255,255,0.12)" },
                }}
              >
                Logout
              </Button>
            </Box>
          ) : null}

          <Box sx={{ display: "flex", gap: 1 }}>
            {gomb("Fighters")}
            {gomb("Details")}
            {gomb("Compare")}
            {gomb("Auth")}
          </Box>
        </Container>
      </Toolbar>
    </AppBar>
  );
}
