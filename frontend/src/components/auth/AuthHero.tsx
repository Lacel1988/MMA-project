import { Box } from "@mui/material";
import { useEffect, useState } from "react";

type Props = {
  images: string[];
};

export default function AuthHero({ images }: Props) {
  const [i, setI] = useState(0);

  useEffect(() => {
    if (!images.length) return;
    const t = setInterval(() => {
      setI((prev) => (prev + 1) % images.length);
    }, 3500);
    return () => clearInterval(t);
  }, [images]);

  const current = images[i] ?? "";

  return (
    <Box
      sx={{
        borderRadius: 3,
        overflow: "hidden",
        border: "1px solid rgba(255,255,255,0.08)",
        minHeight: 520,
        position: "relative",
        bgcolor: "#0b0b0b",
      }}
    >
      <Box
        component="img"
        src={current}
        alt="hero"
        sx={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          display: "block",
          opacity: 0.85,
        }}
        onError={(e) => {
          console.log("Hero image failed:", current);
          (e.currentTarget as HTMLImageElement).style.display = "none";
        }}
      />
    </Box>
  );
}
