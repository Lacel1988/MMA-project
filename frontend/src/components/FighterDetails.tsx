import { useEffect, useMemo, useRef, useState } from "react";
import { Box, Typography, Chip, Divider, Tooltip } from "@mui/material";
import type { Fighter } from "../types";
import FighterAdminEditor from "./FighterAdminEditor";
import { parseBioLongToEvents, type TimelineEvent } from "./parseBioLongToEvents";

type Props = {
  fighter: Fighter | null;
  mode?: "preview" | "full";
  isAdmin?: boolean;
  onUpdated?: (patch: Partial<Fighter>) => void;
};

const titleFont = "var(--mma-title-font)";
const bodyFont = "var(--mma-body-font)";

/**
 * FONTOS: App.css-ben a .mma-timeline-line animáció ideje is legyen 15000ms.
 */
const LINE_MS = 15000;

// CSAK EZ az egy háttérkép játszik a Details fülön
const UFC_DETAILS_BG = "http://localhost:8000/media/fighters/UFC_details_1.png";

export default function FighterDetails({
  fighter,
  mode = "preview",
  isAdmin = false,
  onUpdated,
}: Props) {
  if (!fighter) {
    return (
      <Box
        sx={{
          bgcolor: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 3,
          p: { xs: 2, sm: 2.5 },
          color: "white",
          height: mode === "preview" ? { lg: "100%" } : "auto",
          display: "flex",
          alignItems: "center",
        }}
      >
        <Typography sx={{ opacity: 0.8, fontFamily: bodyFont }}>
          Select a fighter on the left to view details.
        </Typography>
      </Box>
    );
  }

  if (mode === "preview") {
    return <PreviewDetails fighter={fighter} isAdmin={isAdmin} onUpdated={onUpdated} />;
  }

  return <FullTimelineDetails fighter={fighter} />;
}

/* =========================
   PREVIEW
   ========================= */

function PreviewDetails({
  fighter,
  isAdmin,
  onUpdated,
}: {
  fighter: Fighter;
  isAdmin: boolean;
  onUpdated?: (patch: Partial<Fighter>) => void;
}) {
  const kep = fighter.upload_image ?? null;

  const szoveg =
    fighter.description ??
    (fighter.bio_long ? fighter.bio_long.slice(0, 240) + "..." : "");

  return (
    <Box
      sx={{
        bgcolor: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 3,
        overflow: "hidden",
        color: "white",
        height: { lg: "100%" },
        display: "flex",
        flexDirection: "column",
        minHeight: 0,
      }}
    >
      <Box
        sx={{
          height: { xs: 220, sm: 280, md: 320 },
          flexShrink: 0,
          bgcolor: "#0c0c0c",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          p: { xs: 1, sm: 2 },
        }}
      >
        {kep ? (
          <Box
            component="img"
            src={kep}
            alt={fighter.name}
            sx={{
              maxHeight: "100%",
              maxWidth: "100%",
              objectFit: "contain",
            }}
          />
        ) : (
          <Typography sx={{ opacity: 0.7, fontFamily: bodyFont }}>No image</Typography>
        )}
      </Box>

      <Box
        sx={{
          p: { xs: 1.5, sm: 2, md: 2.5 },
          display: "flex",
          flexDirection: "column",
          flexGrow: 1,
          minHeight: 0,
        }}
      >
        <Typography
          sx={{
            fontWeight: 900,
            fontFamily: titleFont,
            letterSpacing: 0.6,
            fontSize: { xs: "1.35rem", sm: "1.6rem" },
            lineHeight: 1.15,
            wordBreak: "break-word",
          }}
        >
          {fighter.name}
        </Typography>

        {isAdmin ? <FighterAdminEditor fighter={fighter} onUpdated={onUpdated} /> : null}

        {fighter.nickname ? (
          <Typography
            sx={{
              mt: 0.5,
              opacity: 0.85,
              fontStyle: "italic",
              fontFamily: bodyFont,
              fontSize: { xs: 14, sm: 16 },
            }}
          >
            "{fighter.nickname}"
          </Typography>
        ) : null}

        <Box
          sx={{
            mt: 1.2,
            display: "flex",
            gap: 1,
            flexWrap: "wrap",
          }}
        >
          <Chip
            label={fighter.division.name}
            sx={{
              bgcolor: "#b71c1c",
              color: "#fff",
              fontWeight: 800,
              fontFamily: titleFont,
              maxWidth: "100%",
              "& .MuiChip-label": {
                display: "block",
                whiteSpace: "normal",
              },
            }}
          />
          <Chip
            label={`Record: ${fighter.wins}-${fighter.losses}-${fighter.draw}`}
            sx={{
              bgcolor: "rgba(255,255,255,0.08)",
              color: "#fff",
              fontFamily: bodyFont,
              maxWidth: "100%",
              "& .MuiChip-label": {
                display: "block",
                whiteSpace: "normal",
              },
            }}
          />
        </Box>

        <Divider sx={{ my: { xs: 1.5, sm: 2 }, borderColor: "rgba(255,255,255,0.10)" }} />

        <Box sx={{ flexGrow: 1, minHeight: 0, overflowY: "auto", pr: { xs: 0.5, sm: 1 } }}>
          <Typography
            sx={{
              opacity: 0.9,
              whiteSpace: "pre-wrap",
              lineHeight: 1.6,
              fontFamily: bodyFont,
              fontSize: { xs: 14, sm: 15.5 },
              wordBreak: "break-word",
            }}
          >
            {szoveg || "No description."}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}

/* =========================
   FULL TIMELINE
   ========================= */

function FullTimelineDetails({ fighter }: { fighter: Fighter }) {
  const [stage, setStage] = useState<"intro" | "timeline">("intro");
  const [flashKey, setFlashKey] = useState<number>(0);

  useEffect(() => {
    setStage("intro");
    setFlashKey((k) => k + 1);

    const id = window.setTimeout(() => setStage("timeline"), 1050);
    return () => window.clearTimeout(id);
  }, [fighter.id]);

  const events: TimelineEvent[] = useMemo(() => parseBioLongToEvents(fighter.bio_long ?? ""), [
    fighter.bio_long,
  ]);

  const hasEvents = events.length >= 3;

  return (
    <Box
      sx={{
        position: "relative",
        borderRadius: 3,
        overflow: "hidden",
        color: "white",
        border: "1px solid rgba(255,255,255,0.08)",
        bgcolor: "#0b0b0b",
      }}
    >
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          background:
            stage === "intro"
              ? "linear-gradient(to bottom, rgba(0,0,0,0.18), rgba(0,0,0,0.74))"
              : "linear-gradient(to bottom, rgba(0,0,0,0.66), rgba(0,0,0,0.93))",
          transition: "background 900ms ease",
        }}
      />

      <Box
        key={flashKey}
        className="mma-flash-once"
        sx={{
          position: "absolute",
          inset: 0,
          bgcolor: "#fff",
          opacity: 0,
          pointerEvents: "none",
        }}
      />

      <Box sx={{ position: "relative", p: { xs: 1.5, sm: 2, md: 2.5 } }}>
        <Typography
          sx={{
            fontFamily: titleFont,
            fontWeight: 900,
            letterSpacing: 0.8,
            fontSize: { xs: "1.6rem", sm: "2rem", md: "2.25rem" },
            lineHeight: 1.1,
            wordBreak: "break-word",
          }}
        >
          {fighter.name}
        </Typography>

        {fighter.nickname ? (
          <Typography
            sx={{
              opacity: 0.85,
              fontStyle: "italic",
              mt: 0.5,
              fontFamily: bodyFont,
              fontSize: { xs: 14, sm: 16 },
            }}
          >
            "{fighter.nickname}"
          </Typography>
        ) : null}

        <Box
          sx={{
            mt: { xs: 1.5, sm: 2 },
            opacity: stage === "timeline" ? 1 : 0,
            transform: stage === "timeline" ? "translateY(0)" : "translateY(14px)",
            transition: "opacity 650ms ease 220ms, transform 650ms ease 220ms",
          }}
        >
          {!hasEvents ? (
            <Box
              sx={{
                mt: 2,
                bgcolor: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.10)",
                borderRadius: 3,
                p: { xs: 1.5, sm: 2 },
              }}
            >
              <Typography
                sx={{
                  opacity: 0.9,
                  fontWeight: 900,
                  fontFamily: titleFont,
                  letterSpacing: 0.4,
                  fontSize: { xs: 18, sm: 20 },
                }}
              >
                No career highlights yet.
              </Typography>
              <Typography
                sx={{
                  opacity: 0.75,
                  mt: 1,
                  fontFamily: bodyFont,
                  fontSize: { xs: 14, sm: 15 },
                }}
              >
                Add at least 3 blocks into bio_long with this format: [YYYY-MM-DD] Title then
                description lines, then an empty line.
              </Typography>
            </Box>
          ) : (
            <TimelineCore events={events} followScroll={true} />
          )}
        </Box>
      </Box>
    </Box>
  );
}

function TimelineCore({
  events,
  followScroll,
}: {
  events: TimelineEvent[];
  followScroll?: boolean;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!followScroll) return;
    const el = containerRef.current;
    if (!el) return;

    let raf = 0;
    const start = performance.now();

    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / LINE_MS);

      const rect = el.getBoundingClientRect();
      const topAbs = window.scrollY + rect.top;
      const height = rect.height;

      const focusOffset = window.innerHeight * 0.8;
      const target = topAbs + progress * height - focusOffset;

      window.scrollTo({ top: Math.max(0, target), behavior: "auto" });

      if (progress < 1) {
        raf = requestAnimationFrame(tick);
      } else {
        window.setTimeout(() => {
          window.scrollTo({ top: Math.max(0, topAbs - 24), behavior: "smooth" });
        }, 450);
      }
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [followScroll]);

  return (
    <Box
      ref={containerRef}
      sx={{
        mt: 2,
        position: "relative",
        borderRadius: 3,
        bgcolor: "rgba(0,0,0,0.06)",
        border: "1px solid rgba(255,255,255,0.08)",
        overflow: "hidden",
      }}
    >
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          opacity: 0.28,
          pointerEvents: "none",
          backgroundImage: `url(${UFC_DETAILS_BG})`,
          backgroundRepeat: "no-repeat",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />

      <Box
        sx={{
          position: "relative",
          px: { xs: 1, sm: 2, md: 3 },
          py: { xs: 4, sm: 6, md: 10 },
        }}
      >
        <Box
          className="mma-timeline-line"
          sx={{
            position: "absolute",
            top: 0,
            bottom: 0,
            left: { xs: 24, sm: 30, md: "50%" },
            transform: "translateX(-50%)",
            width: { xs: 8, sm: 10, md: 18 },
            borderRadius: 999,
            bgcolor: "rgba(183,28,28,0.95)",
            boxShadow: "0 0 14px rgba(183,28,28,0.14)",
          }}
        />

        <Box>
          {events.map((ev, idx) => (
            <TimelineRow key={`${ev.date}-${idx}`} ev={ev} idx={idx} />
          ))}
        </Box>
      </Box>
    </Box>
  );
}

function TimelineRow({ ev, idx }: { ev: TimelineEvent; idx: number }) {
  const titleOnLeft = idx % 2 === 0;

  const titleSx = {
    fontFamily: titleFont,
    fontWeight: 900,
    letterSpacing: 0.7,
    opacity: 0.97,
    textShadow: "0 10px 20px rgba(0,0,0,0.45)",
    fontSize: "clamp(1rem, 1.6vw, 1.35rem)",
    lineHeight: 1.2,
    wordBreak: "break-word",
  } as const;

  const dateSx = {
    ...titleSx,
    fontSize: "clamp(0.82rem, 1.2vw, 0.95rem)",
    opacity: 0.92,
  } as const;

  return (
    <Box
      sx={{
        position: "relative",
        display: "grid",
        gridTemplateColumns: {
          xs: "1fr",
          sm: "1fr",
          md: "1fr 140px 1fr",
        },
        alignItems: "center",
        gap: { xs: 1, sm: 1.5, md: 0 },
        py: { xs: 3, sm: 4, md: 3.5 },
        minHeight: { xs: 74, sm: 84, md: 96 },
      }}
    >
      <Box sx={{ display: { xs: "none", md: "block" }, pr: 4, textAlign: "right" }}>
        {titleOnLeft ? (
          <Typography sx={titleSx}>{ev.title}</Typography>
        ) : (
          <Typography sx={dateSx}>{ev.date}</Typography>
        )}
      </Box>

      <Box
        sx={{
          display: { xs: "none", md: "block" },
          position: "relative",
          height: 40,
        }}
      >
        <Tooltip
          arrow
          placement={titleOnLeft ? "left" : "right"}
          slotProps={{
            tooltip: {
              sx: {
                bgcolor: "rgba(10,10,10,0.92)",
                border: "1px solid rgba(255,255,255,0.14)",
                backdropFilter: "blur(8px)",
                fontFamily: bodyFont,
                fontSize: 14,
                lineHeight: 1.7,
                maxWidth: { xs: 280, sm: 380, md: 520 },
                p: 1.5,
              },
            },
            arrow: { sx: { color: "rgba(10,10,10,0.92)" } },
          }}
          title={
            <Box>
              <Typography sx={{ fontFamily: titleFont, fontWeight: 900, letterSpacing: 0.5 }}>
                {ev.title}
              </Typography>
              <Typography sx={{ opacity: 0.8, mt: 0.3, fontFamily: bodyFont, fontSize: 12 }}>
                {ev.date}
              </Typography>
              <Typography sx={{ mt: 1, whiteSpace: "pre-wrap", fontFamily: bodyFont }}>
                {ev.text || "No description."}
              </Typography>
            </Box>
          }
        >
          <Box
            className="mma-timeline-dot"
            sx={{
              cursor: "pointer",
              position: "absolute",
              left: "50%",
              top: "50%",
              width: { md: 22 },
              height: { md: 22 },
              borderRadius: 999,
              bgcolor: "rgba(255,255,255,0.92)",
              transform: "translate(-50%, -50%)",
              boxShadow: "0 0 0 5px rgba(183,28,28,0.16), 0 0 10px rgba(183,28,28,0.10)",
              transition: "transform 140ms ease",
              "&:hover": { transform: "translate(-50%, -50%) scale(1.06)" },
            }}
            style={{
              ["--dot-delay" as any]: `${3800 + idx * 380}ms`,
            }}
          />
        </Tooltip>
      </Box>

      <Box sx={{ display: { xs: "none", md: "block" }, pl: 4, textAlign: "left" }}>
        {!titleOnLeft ? (
          <Typography sx={titleSx}>{ev.title}</Typography>
        ) : (
          <Typography sx={dateSx}>{ev.date}</Typography>
        )}
      </Box>

      <Box
        sx={{
          display: { xs: "block", md: "none" },
          position: "relative",
          pl: { xs: 5.5, sm: 6.5 },
          minWidth: 0,
        }}
      >
        <Tooltip
          arrow
          placement="right"
          slotProps={{
            tooltip: {
              sx: {
                bgcolor: "rgba(10,10,10,0.92)",
                border: "1px solid rgba(255,255,255,0.14)",
                backdropFilter: "blur(8px)",
                fontFamily: bodyFont,
                fontSize: 14,
                lineHeight: 1.7,
                maxWidth: { xs: 280, sm: 380 },
                p: 1.5,
              },
            },
            arrow: { sx: { color: "rgba(10,10,10,0.92)" } },
          }}
          title={
            <Box>
              <Typography sx={{ fontFamily: titleFont, fontWeight: 900, letterSpacing: 0.5 }}>
                {ev.title}
              </Typography>
              <Typography sx={{ opacity: 0.8, mt: 0.3, fontFamily: bodyFont, fontSize: 12 }}>
                {ev.date}
              </Typography>
              <Typography sx={{ mt: 1, whiteSpace: "pre-wrap", fontFamily: bodyFont }}>
                {ev.text || "No description."}
              </Typography>
            </Box>
          }
        >
          <Box
            className="mma-timeline-dot"
            sx={{
              cursor: "pointer",
              position: "absolute",
              left: { xs: 24, sm: 30 },
              top: "50%",
              width: { xs: 16, sm: 18 },
              height: { xs: 16, sm: 18 },
              borderRadius: 999,
              bgcolor: "rgba(255,255,255,0.92)",
              transform: "translate(-50%, -50%)",
              boxShadow: "0 0 0 5px rgba(183,28,28,0.16), 0 0 10px rgba(183,28,28,0.10)",
              transition: "transform 140ms ease",
              "&:hover": { transform: "translate(-50%, -50%) scale(1.06)" },
            }}
            style={{
              ["--dot-delay" as any]: `${3800 + idx * 380}ms`,
            }}
          />
        </Tooltip>

        <Typography sx={titleSx}>{ev.title}</Typography>
        <Typography sx={{ ...dateSx, mt: 0.5 }}>{ev.date}</Typography>
        <Typography
          sx={{
            mt: 0.8,
            opacity: 0.72,
            fontFamily: bodyFont,
            fontSize: 13,
            lineHeight: 1.5,
          }}
        >
          Tap the dot for details.
        </Typography>
      </Box>
    </Box>
  );
}