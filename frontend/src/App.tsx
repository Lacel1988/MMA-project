import { useEffect, useMemo, useState } from "react";
import { Container, Box, Typography, IconButton, Tooltip } from "@mui/material";
import useMediaQuery from "@mui/material/useMediaQuery";

import Navbar from "./components/Navbar";
import FighterGrid from "./components/FighterGrid";
import FighterDetails from "./components/FighterDetails";
import ComparePanel from "./components/compare/ComparePanel";
import CategoriesPage from "./components/MmaForum";

import AuthPanel from "./components/auth/AuthPanel";
import AuthHero from "./components/auth/AuthHero";

import type { Fighter } from "./types";
import { fetchMe, logout, type MeResponse } from "./api/authApi";
import { UnitProvider } from "./context/UnitContext";

import FilterSidebar from "./components/FilterSidebar";
import FilterListIcon from "@mui/icons-material/FilterList";

type Ful = "Fighters" | "Details" | "Compare" | "Auth" | "Forum";

const API_URL = "http://127.0.0.1:8000/api";

type Division = {
  id: number;
  name: string;
};

export default function App() {
  const NAV_H = 64;
  const drawerWidth = 360;

  const isDesktop = useMediaQuery("(min-width:1200px)");

  const [fighters, setFighters] = useState<Fighter[]>([]);
  const [hiba, setHiba] = useState<string>("");

  const [kivalasztott, setKivalasztott] = useState<Fighter | null>(null);
  const [aktivFül, setAktivFül] = useState<Ful>("Auth");

  const [user, setUser] = useState<MeResponse | null>(null);
  const isAdmin = !!user?.is_staff || !!user?.is_superuser;

  const [left, setLeft] = useState<Fighter | null>(null);
  const [right, setRight] = useState<Fighter | null>(null);

  const [filterOpen, setFilterOpen] = useState(false);
  const [aktivDivisionId, setAktivDivisionId] = useState<number | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      setUser(null);
      setAktivFül("Auth");
      return;
    }

    fetchMe()
      .then((me) => {
        setUser(me);
        setAktivFül("Fighters");
      })
      .catch(() => {
        logout();
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

  const divisions: Division[] = useMemo(() => {
    const map = new Map<number, Division>();

    for (const f of fighters as any[]) {
      const d = f?.division;
      if (d && typeof d?.id === "number" && typeof d?.name === "string") {
        map.set(d.id, { id: d.id, name: d.name });
      }
    }

    return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [fighters]);

  const filteredFighters = useMemo(() => {
    const q = search.trim().toLowerCase();

    return fighters.filter((f) => {
      const okDiv = aktivDivisionId === null ? true : f.division?.id === aktivDivisionId;
      if (!okDiv) return false;

      if (!q) return true;

      const name = (f.name ?? "").toLowerCase();
      const nick = ((f as any).nickname ?? "").toString().toLowerCase();
      return name.includes(q) || nick.includes(q);
    });
  }, [fighters, aktivDivisionId, search]);

  useEffect(() => {
    if (aktivFül !== "Fighters" && aktivFül !== "Details") return;

    if (!kivalasztott) {
      setKivalasztott(filteredFighters[0] ?? null);
      return;
    }

    const exists = filteredFighters.some((x) => x.id === kivalasztott.id);
    if (!exists) setKivalasztott(filteredFighters[0] ?? null);
  }, [filteredFighters, aktivFül]); // eslint-disable-line react-hooks/exhaustive-deps

  const pageLeftPadding =
    aktivFül === "Fighters" && isDesktop && filterOpen ? drawerWidth : 0;

  const tartalom = hiba ? (
    <Typography sx={{ color: "#ff6b6b" }}>Error: {hiba}</Typography>
  ) : (
    <>
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
                setUser(me);
                setAktivFül("Fighters");
              }}
            />
          </Box>

          <AuthHero images={["/hero/hero1.jpg", "/hero/hero2.jpg", "/hero/hero3.jpg"]} />
        </Box>
      )}

      {aktivFül === "Fighters" && (
        <Box sx={{ position: "relative" }}>
          {/* Filter gomb: csak akkor, ha nincs nyitva a filter */}
          {!filterOpen && (
            <Tooltip title="Filters">
              <IconButton
                onClick={() => setFilterOpen(true)}
                sx={{
                  position: "fixed",
                  left: 16,
                  top: NAV_H + 16,
                  zIndex: 1500,
                  bgcolor: "rgba(0,0,0,0.55)",
                  border: "1px solid rgba(255,255,255,0.14)",
                  backdropFilter: "blur(10px)",
                  color: "white",
                  "&:hover": { bgcolor: "rgba(0,0,0,0.75)" },
                }}
              >
                <FilterListIcon />
              </IconButton>
            </Tooltip>
          )}

          <FilterSidebar
            open={filterOpen}
            onClose={() => setFilterOpen(false)}
            divisions={divisions}
            aktivDivisionId={aktivDivisionId}
            setAktivDivisionId={setAktivDivisionId}
            search={search}
            setSearch={setSearch}
            title="Division filter"
            navHeight={NAV_H}
            variant={isDesktop ? "persistent" : "temporary"}
          />

          {/* CONTENT: desktopon tolódik jobbra, ha nyitva a drawer */}
          <Box
            sx={{
              pl: `${pageLeftPadding}px`,
              transition: "padding-left 200ms ease",
              display: "grid",
              gap: 3,
              gridTemplateColumns: { xs: "1fr", lg: "2fr 1fr" },
              alignItems: "start",
            }}
          >
            <Box sx={{ minWidth: 0 }}>
              <FighterGrid
                fighters={filteredFighters}
                selectedId={kivalasztott?.id ?? null}
                onSelect={(f) => setKivalasztott(f)}
              />
            </Box>

            <Box
              sx={{
                minWidth: 0,
                position: { lg: "sticky" },
                top: { lg: 12 },
                alignSelf: "start",
                pt: { lg: 8 },
              }}
            >
              <FighterDetails
                fighter={kivalasztott}
                mode="preview"
                isAdmin={isAdmin}
                onUpdated={(patch) => {
                  const id = kivalasztott?.id;

                  setKivalasztott((prev) => (prev ? { ...prev, ...patch } : prev));

                  if (id != null) {
                    setFighters((prev) => prev.map((f) => (f.id === id ? { ...f, ...patch } : f)));
                  }

                  setLeft((prev) => (prev && prev.id === id ? { ...prev, ...patch } : prev));
                  setRight((prev) => (prev && prev.id === id ? { ...prev, ...patch } : prev));
                }}
              />
            </Box>
          </Box>
        </Box>
      )}

      {aktivFül === "Details" && (
        <FighterDetails
          fighter={kivalasztott}
          mode="full"
          isAdmin={isAdmin}
          onUpdated={(patch) => {
            setKivalasztott((prev) => (prev ? { ...prev, ...patch } : prev));
            setFighters((prev) =>
              prev.map((f) => (f.id === kivalasztott?.id ? { ...f, ...patch } : f))
            );
          }}
        />
      )}

      {aktivFül === "Compare" && (
        <ComparePanel
          fighters={fighters}
          left={left}
          right={right}
          setLeft={setLeft}
          setRight={setRight}
        />
      )}

      {aktivFül === "Forum" && <CategoriesPage />}
    </>
  );

  return (
    <UnitProvider>
      <Box sx={{ minHeight: "100vh", bgcolor: "#0b0b0b" }}>
        <Navbar height={NAV_H} aktivFül={aktivFül} setAktivFül={setAktivFül} user={user} onLogout={handleLogout} />

        <Box sx={{ height: NAV_H }} />

        <Box component="main" sx={{ minHeight: `calc(100vh - ${NAV_H}px)`, bgcolor: "#0b0b0b" }}>
          {aktivFül === "Compare" ? (
            <Box sx={{ py: 3, px: { xs: 2, sm: 3, md: 4 } }}>
              <Box sx={{ maxWidth: 1100, mx: "auto" }}>{tartalom}</Box>
            </Box>
          ) : (
            <Container maxWidth="xl" sx={{ py: 3 }}>
              {tartalom}
            </Container>
          )}
        </Box>
      </Box>
    </UnitProvider>
  );
}