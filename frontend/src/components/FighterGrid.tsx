import { useMemo, useCallback, useEffect, useRef, useState } from "react";
import { Box } from "@mui/material";
import { FixedSizeGrid } from "react-window";
import type { Fighter } from "../types";
import FighterCard from "./FighterCard";

type Props = {
  fighters: Fighter[];
  selectedId: number | null;
  onSelect: (f: Fighter) => void;
};

function getColumnCount(width: number) {
   return 3;
}

export default function FighterGrid({ fighters, selectedId, onSelect }: Props) {
  const handleClick = useCallback((f: Fighter) => onSelect(f), [onSelect]);
  const items = useMemo(() => fighters ?? [], [fighters]);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const [containerWidth, setContainerWidth] = useState(1200);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const ro = new ResizeObserver(() => {
      const w = el.clientWidth || 1200;
      setContainerWidth(w);
    });

    ro.observe(el);
    setContainerWidth(el.clientWidth || 1200);

    return () => ro.disconnect();
  }, []);

  const columnCount = useMemo(
    () => getColumnCount(containerWidth),
    [containerWidth]
  );

  const rowCount = useMemo(
    () => Math.ceil(items.length / columnCount),
    [items.length, columnCount]
  );

  // kb gap: 2.25 * 8 = 18px (az eredeti grid gap 2.25 volt)
  const gap = 18;

  const columnWidth = useMemo(() => {
    const safe = Math.max(containerWidth - gap * (columnCount - 1), 320);
    return Math.floor(safe / columnCount);
  }, [containerWidth, columnCount]);

  // React-window miatt fix sor magasság kell.
  // Ha alul levágódik, emeld 340-360-ra.
  const rowHeight = 320;

  // Itt fix magasság van. Ha akarod, később kiszámoljuk 100vh - header alapján.
  const height = 900;

  const Cell = useCallback(
    ({ columnIndex, rowIndex, style }: any) => {
      const index = rowIndex * columnCount + columnIndex;
      const f = items[index];
      if (!f) return null;

      // react-window style-hoz hozzáadjuk a gap-et
      const left = Number(style.left) + columnIndex * gap;
      const top = Number(style.top) + rowIndex * gap;

      return (
        <div
          style={{
            ...style,
            left,
            top,
            width: style.width,
            height: style.height,
          }}
        >
          <FighterCard
            fighter={f}
            selected={selectedId === f.id}
            onClick={() => handleClick(f)}
          />
        </div>
      );
    },
    [items, columnCount, gap, selectedId, handleClick]
  );

  return (
    <Box ref={containerRef} sx={{ width: "100%" }}>
      <FixedSizeGrid
        columnCount={columnCount}
        columnWidth={columnWidth}
        height={height}
        rowCount={rowCount}
        rowHeight={rowHeight}
        width={containerWidth}
        overscanRowCount={2}
      >
        {Cell}
      </FixedSizeGrid>
    </Box>
  );
}