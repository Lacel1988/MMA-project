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
  if (width < 700) return 1;
  if (width < 1100) return 2;
  return 3;
}

export default function FighterGrid({ fighters, selectedId, onSelect }: Props) {
  const handleClick = useCallback((f: Fighter) => onSelect(f), [onSelect]);
  const items = useMemo(() => fighters ?? [], [fighters]);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const [containerWidth, setContainerWidth] = useState(1200);
  const [gridHeight, setGridHeight] = useState(900);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const updateSize = () => {
      setContainerWidth(el.clientWidth || 1200);

      const rect = el.getBoundingClientRect();
      const available = window.innerHeight - rect.top - 24;
      setGridHeight(Math.max(available, 520));
    };

    const ro = new ResizeObserver(updateSize);
    ro.observe(el);
    updateSize();

    window.addEventListener("resize", updateSize);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", updateSize);
    };
  }, []);

  const columnCount = useMemo(
    () => getColumnCount(containerWidth),
    [containerWidth]
  );

  const rowCount = useMemo(
    () => Math.ceil(items.length / columnCount),
    [items.length, columnCount]
  );

  const gap = 18;
  const horizontalPadding = 10;
  const scrollbarReserve = 16;

  const usableWidth = useMemo(() => {
    return Math.max(
      containerWidth - horizontalPadding * 2 - scrollbarReserve,
      320
    );
  }, [containerWidth]);

  const columnWidth = useMemo(() => {
    const totalGap = gap * (columnCount - 1);
    return Math.floor((usableWidth - totalGap) / columnCount);
  }, [usableWidth, columnCount]);

  const rowHeight = 360;

  const Cell = useCallback(
    ({ columnIndex, rowIndex, style }: any) => {
      const index = rowIndex * columnCount + columnIndex;
      const f = items[index];
      if (!f) return null;

      return (
        <div
          style={{
            ...style,
            left: Number(style.left) + horizontalPadding,
            top: Number(style.top),
            width: Number(style.width),
            height: Number(style.height),
            boxSizing: "border-box",
            paddingRight: columnIndex < columnCount - 1 ? gap : 0,
            paddingBottom: gap,
          }}
        >
          <Box sx={{ width: "100%", height: "100%" }}>
            <FighterCard
              fighter={f}
              selected={selectedId === f.id}
              onClick={() => handleClick(f)}
            />
          </Box>
        </div>
      );
    },
    [items, columnCount, gap, horizontalPadding, selectedId, handleClick]
  );

  return (
    <Box
      ref={containerRef}
      data-testid="fighter-grid"
      aria-label={`${items.length} fighters found`}
      sx={{
        width: "100%",
        minWidth: 0,
      }}
    >
      <FixedSizeGrid
        columnCount={columnCount}
        columnWidth={columnWidth}
        height={gridHeight}
        rowCount={rowCount}
        rowHeight={rowHeight}
        width={usableWidth + scrollbarReserve + horizontalPadding * 2}
        overscanRowCount={2}
        overscanColumnCount={1}
      >
        {Cell}
      </FixedSizeGrid>
    </Box>
  );
}
