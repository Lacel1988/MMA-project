import { useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Chip,
  Container,
  IconButton,
  Drawer,
  Divider,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import type { MeResponse } from "../api/authApi";
import UnitSwitch from "./UnitSwitch";

type Tab = "Fighters" | "Details" | "Compare" | "Auth" | "Forum";

type NavbarProps = {
  aktivFül: Tab;
  setAktivFül: (tab: Tab) => void;
  user: MeResponse | null;
  onLogout: () => void;
  height?: number;
};

export default function Navbar({
  aktivFül,
  setAktivFül,
  user,
  onLogout,
  height = 64,
}: NavbarProps) {
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  const showUnitSwitch = aktivFül === "Fighters" || aktivFül === "Compare";

  const handleTabChange = (tab: Tab, closeDrawer = false) => {
    setAktivFül(tab);

    if (closeDrawer) {
      setMobileDrawerOpen(false);
    }
  };

  const handleLogout = (closeDrawer = false) => {
    onLogout();

    if (closeDrawer) {
      setMobileDrawerOpen(false);
    }
  };

  const renderNavButton = (label: Tab, mobile = false) => (
    <Button
      key={label}
      fullWidth={mobile}
      onClick={() => handleTabChange(label, mobile)}
      sx={{
        textTransform: "none",
        fontWeight: 800,
        fontStyle: "italic",
        borderRadius: 2,
        px: 2,
        py: 1,
        justifyContent: mobile ? "flex-start" : "center",
        color: aktivFül === label ? "#fff" : "rgba(255,255,255,0.85)",
        bgcolor: aktivFül === label ? "#b71c1c" : "rgba(255,255,255,0.06)",
        boxShadow:
          aktivFül === label
            ? "inset 0 0 0 2px rgba(255,255,255,0.35)"
            : "none",
        "&:hover": {
          bgcolor: aktivFül === label ? "#c62828" : "rgba(255,255,255,0.12)",
        },
      }}
    >
      {label}
    </Button>
  );

  return (
    <>
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
            <Typography
              variant="h6"
              sx={{
                fontWeight: 900,
                letterSpacing: 1,
                whiteSpace: "nowrap",
                fontSize: { xs: "1rem", sm: "1.25rem" },
              }}
            >
              MMA <span style={{ color: "#b71c1c" }}>PROJECT</span>
            </Typography>

            <Box sx={{ flexGrow: 1 }} />

            <Box
              sx={{
                display: { xs: "none", md: "flex" },
                alignItems: "center",
                gap: 2,
              }}
            >
              {showUnitSwitch ? <UnitSwitch /> : null}

              {user ? (
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Chip
                    label={`Hi, ${user.username}`}
                    sx={{
                      bgcolor: "rgba(255,255,255,0.08)",
                      color: "white",
                    }}
                  />
                  <Button
                    onClick={() => handleLogout()}
                    sx={{
                      textTransform: "none",
                      fontWeight: 900,
                      borderRadius: 2,
                      color: "white",
                      bgcolor: "rgba(255,255,255,0.06)",
                      "&:hover": {
                        bgcolor: "rgba(255,255,255,0.12)",
                      },
                    }}
                  >
                    Logout
                  </Button>
                </Box>
              ) : null}

              <Box sx={{ display: "flex", gap: 1 }}>
                {renderNavButton("Fighters")}
                {renderNavButton("Details")}
                {renderNavButton("Compare")}
                {renderNavButton("Forum")}
                {renderNavButton("Auth")}
              </Box>
            </Box>

            <Box sx={{ display: { xs: "flex", md: "none" } }}>
              <IconButton
                onClick={() => setMobileDrawerOpen(true)}
                sx={{ color: "white" }}
                aria-label="Open navigation menu"
              >
                <MenuIcon />
              </IconButton>
            </Box>
          </Container>
        </Toolbar>
      </AppBar>

      <Drawer
        anchor="right"
        open={mobileDrawerOpen}
        onClose={() => setMobileDrawerOpen(false)}
        PaperProps={{
          sx: {
            width: 280,
            bgcolor: "#111",
            color: "white",
            p: 2,
          },
        }}
      >
        <Typography sx={{ fontWeight: 900, mb: 2 }}>
          MMA <span style={{ color: "#b71c1c" }}>PROJECT</span>
        </Typography>

        {showUnitSwitch ? (
          <Box sx={{ mb: 2 }}>
            <UnitSwitch />
          </Box>
        ) : null}

        {user ? (
          <Box
            sx={{
              mb: 2,
              display: "flex",
              flexDirection: "column",
              gap: 1,
            }}
          >
            <Chip
              label={`Hi, ${user.username}`}
              sx={{
                bgcolor: "rgba(255,255,255,0.08)",
                color: "white",
                width: "fit-content",
              }}
            />
            <Button
              onClick={() => handleLogout(true)}
              fullWidth
              sx={{
                textTransform: "none",
                fontWeight: 900,
                borderRadius: 2,
                color: "white",
                bgcolor: "rgba(255,255,255,0.06)",
                justifyContent: "flex-start",
                "&:hover": {
                  bgcolor: "rgba(255,255,255,0.12)",
                },
              }}
            >
              Logout
            </Button>
          </Box>
        ) : null}

        <Divider
          sx={{
            borderColor: "rgba(255,255,255,0.12)",
            mb: 2,
          }}
        />

        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
          {renderNavButton("Fighters", true)}
          {renderNavButton("Details", true)}
          {renderNavButton("Compare", true)}
          {renderNavButton("Forum", true)}
          {renderNavButton("Auth", true)}
        </Box>
      </Drawer>
    </>
  );
}