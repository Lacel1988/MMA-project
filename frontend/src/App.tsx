import { useEffect, useState } from "react";
import { Container, Box, Typography } from "@mui/material";
import Navbar from "./components/Navbar";
import FighterGrid from "./components/FighterGrid";
import FighterDetails from "./components/FighterDetails";
import ComparePanel from "./components/compare/ComparePanel";

import AuthPanel from "./components/auth/AuthPanel";
import AuthHero from "./components/auth/AuthHero";

import type { Fighter } from "./types";
import { fetchMe, logout } from "./api/authApi";

type Ful = "Fighters" | "Details" | "Compare" | "Auth";

const API_URL = "http://127.0.0.1:8000/api";

export default function App() {
  const NAV_H = 64;

  const [fighters, setFighters] = useState<Fighter[]>([]);
  const [hiba, setHiba] = useState<string>("");

  const [kivalasztott, setKivalasztott] = useState<Fighter | null>(null);
  const [aktivFül, setAktivFül] = useState<Ful>("Auth");

  const [user, setUser] = useState<{ username: string } | null>(null);

  const [left, setLeft] = useState<Fighter | null>(null);
  const [right, setRight] = useState<Fighter | null>(null);

  useEffect(() => {
    fetchMe()
      .then((me) => {
        setUser({ username: me.username });
        setAktivFül("Fighters");
      })
      .catch(() => {
        setUser(null);
        setAktivFül("Auth");
      });
  }, []);

  useEffect(() => {
    fetch(`${API_URL}/fighters/`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to retrieve the data.");
        return res.json();
      })
      .then((data: Fighter[]) => {
        setFighters(data);
        setKivalasztott((prev) => prev ?? (data.length > 0 ? data[0] : null));
      })
      .catch((err) => setHiba(err.message));
  }, []);

  function handleLogout() {
    logout();
    setUser(null);
    setAktivFül("Auth");
  }

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#0b0b0b" }}>
      <Navbar
        height={NAV_H}
        aktivFül={aktivFül}
        setAktivFül={setAktivFül}
        user={user}
        onLogout={handleLogout}
      />

      {/* spacer a fixed navbar alá */}
      <Box sx={{ height: NAV_H }} />

      <Box
        component="main"
        sx={{
          minHeight: `calc(100vh - ${NAV_H}px)`,
          bgcolor: "#0b0b0b",
        }}
      >
        <Container maxWidth="xl" sx={{ py: 3 }}>
          {hiba ? (
            <Typography sx={{ color: "#ff6b6b" }}>Error: {hiba}</Typography>
          ) : (
            <>
              {/* AUTH */}
              {aktivFül === "Auth" && (
                <Box
                  sx={{
                    display: "grid",
                    gap: 3,
                    gridTemplateColumns: { xs: "1fr", lg: "520px 1fr" },
                    alignItems: "stretch",
                    minHeight: { lg: `calc(100vh - ${NAV_H}px - 48px)` },
                  }}
                >
                  <Box>
                    <Typography variant="h4" sx={{ mb: 2, color: "white" }}>
                      Auth
                    </Typography>

                    <AuthPanel
                      onLoginSuccess={(me) => {
                        setUser({ username: me.username });
                        setAktivFül("Fighters");
                      }}
                    />
                  </Box>

                  <AuthHero images={["/hero/hero1.jpg", "/hero/hero2.jpg", "/hero/hero3.jpg"]} />
                </Box>
              )}

              {/* FIGHTERS */}
              {aktivFül === "Fighters" && (
                <Box
                  sx={{
                    display: "grid",
                    gap: 3,
                    gridTemplateColumns: { xs: "1fr", lg: "2fr 1fr" },
                    alignItems: "start",
                  }}
                >
                  {/* BAL: sima page-scroll, nincs belső levágás */}
                  <Box sx={{ minWidth: 0 }}>
                    <FighterGrid
                      fighters={fighters}
                      selectedId={kivalasztott?.id ?? null}
                      onSelect={(f) => setKivalasztott(f)}
                    />
                  </Box>

                  {/* JOBB: sticky, hogy szemlézés közben látszódjon */}
                  <Box
                    sx={{
                      minWidth: 0,
                      position: { lg: "sticky" },
                      top: { lg: 12 },
                      alignSelf: "start",
                      pt: { lg: 8 },
                    }}
                  >
                    <FighterDetails fighter={kivalasztott} mode="preview" />
                  </Box>
                </Box>
              )}

              {/* DETAILS */}
              {aktivFül === "Details" && (
                <FighterDetails fighter={kivalasztott} mode="full" />
              )}

              {/* COMPARE */}
              {aktivFül === "Compare" && (
                <ComparePanel
                  fighters={fighters}
                  left={left}
                  right={right}
                  setLeft={setLeft}
                  setRight={setRight}
                />
              )}
            </>
          )}
        </Container>
      </Box>
    </Box>
  );
}
