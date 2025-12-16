import { useEffect, useMemo, useState } from "react";
import { Box, Typography } from "@mui/material";

type Slide = {
  img: string;
  title: string;
  subtitle: string;
};

export default function AuthHero() {
  const slides: Slide[] = useMemo(
    () => [
      { img: "/auth/hero1.jpg", title: "Tale of the Tape", subtitle: "Compare fighters like a broadcast." },
      { img: "/auth/hero2.jpg", title: "Fighter Profiles", subtitle: "Records, stats, and story." },
      { img: "/auth/hero3.jpg", title: "Built for MMA", subtitle: "Clean UI. Fast browsing. Dark theme." },
    ],
    []
  );

  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setIndex((p) => (p + 1) % slides.length), 6500);
    return () => clearInterval(id);
  }, [slides.length]);

  return (
    <Box
      sx={{
        borderRadius: 3,
        overflow: "hidden",
        border: "1px solid rgba(255,255,255,0.08)",
        bgcolor: "rgba(255,255,255,0.04)",
        minHeight: 520,
        position: "relative",
      }}
    >
      {slides.map((s, i) => (
        <Box
          key={s.title}
          sx={{
            position: "absolute",
            inset: 0,
            opacity: i === index ? 1 : 0,
            transition: "opacity 900ms ease",
          }}
        >
          <Box
            sx={{
              position: "absolute",
              inset: 0,
              backgroundImage: `url(${s.img})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              transform: i === index ? "scale(1.04)" : "scale(1.0)",
              transition: "transform 6500ms ease",
              filter: "contrast(1.02) saturate(1.05)",
            }}
          />
          <Box
            sx={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(90deg, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.55) 55%, rgba(0,0,0,0.20) 100%)",
            }}
          />
        </Box>
      ))}

      <Box sx={{ position: "relative", p: 3, color: "white", maxWidth: 520 }}>
        <Typography sx={{ opacity: 0.75, fontWeight: 800, letterSpacing: 1 }}>
          MMA PROJECT
        </Typography>

        <Typography variant="h3" sx={{ mt: 1, fontWeight: 950, lineHeight: 1.05 }}>
          {slides[index].title}
        </Typography>

        <Typography sx={{ mt: 1.5, opacity: 0.88, fontSize: 16, lineHeight: 1.6 }}>
          {slides[index].subtitle}
        </Typography>

        <Box sx={{ mt: 3, display: "flex", gap: 1 }}>
          {slides.map((_, i) => (
            <Box
              key={i}
              sx={{
                width: i === index ? 26 : 10,
                height: 10,
                borderRadius: 99,
                bgcolor: i === index ? "#b71c1c" : "rgba(255,255,255,0.25)",
                transition: "width 250ms ease",
              }}
            />
          ))}
        </Box>
      </Box>
    </Box>
  );
}
