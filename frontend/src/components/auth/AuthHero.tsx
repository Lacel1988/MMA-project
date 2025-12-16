import { Box } from "@mui/material";
import { useEffect, useState } from "react";

type Props = {
  images: string[];
  height?: number;
};

export default function AuthHero({ images, height }: Props) {
  const [i, setI] = useState(0);
  const current = images[i] ?? "";

  useEffect(() => {
    if (!images?.length) return;
    images.forEach((src) => {
      const img = new Image();
      img.src = src;
    });
  }, [images]);

  useEffect(() => {
    if (!images.length) return;
    const t = setInterval(() => {
      setI((prev) => (prev + 1) % images.length);
    }, 3500);
    return () => clearInterval(t);
  }, [images]);

  return (
    <Box
      sx={{
        borderRadius: 3,
        overflow: "hidden",
        border: "1px solid rgba(255,255,255,0.08)",
        height: height ?? "100%",
        minHeight: 520,
        width: "100%",
        position: "relative",
        bgcolor: "#0b0b0b",
      }}
    >
      {/* blur hatás */}
      <Box
        component="img"
        src={current}
        alt=""
        aria-hidden="true"
        sx={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          transform: "scale(1.06)",
          filter: "blur(18px)",
          opacity: 0.45,
          pointerEvents: "none",
          userSelect: "none",
        }}
      />

      {/* kontraszt */}
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(180deg, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.55) 100%)",
        }}
      />

      {/* fullpic no cut, ohh yea :)  */}
      <Box
        component="img"
        src={current}
        alt="hero"
        loading="eager"
        decoding="async"
        sx={{
          position: "relative",
          zIndex: 1,
          width: "100%",
          height: "100%",
          display: "block",
          objectFit: "contain",
          objectPosition: "center",
          pointerEvents: "none",
          userSelect: "none",
        }}
      />
    </Box>
  );
}
