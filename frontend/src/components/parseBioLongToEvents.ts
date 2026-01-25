export type TimelineEvent = {
  date: string;
  title: string;
  text: string;
};

function normalizeNewlines(szoveg: string): string {
  return szoveg.split("\r\n").join("\n").split("\r").join("\n");
}

function trimEmptyLinesAtEnds(lines: string[]): string[] {
  let start = 0;
  let end = lines.length - 1;

  while (start <= end && lines[start].trim() === "") start++;
  while (end >= start && lines[end].trim() === "") end--;

  return lines.slice(start, end + 1);
}

function parseHeaderLine(elsoSor: string): { date: string; title: string } | null {
  const s = elsoSor.trim();
  if (!s.startsWith("[")) return null;

  const closeIdx = s.indexOf("]");
  if (closeIdx < 0) return null;

  const date = s.slice(1, closeIdx).trim();
  const title = s.slice(closeIdx + 1).trim();

  if (!date || !title) return null;
  return { date, title };
}

export function parseBioLongToEvents(bioLong: string | null | undefined): TimelineEvent[] {
  if (!bioLong) return [];

  const normalized = normalizeNewlines(bioLong).trim();
  if (!normalized) return [];

  const blocks = normalized
    .split("\n\n")
    .map((b) => b.trim())
    .filter((b) => b.length > 0);

  const events: TimelineEvent[] = [];

  for (const block of blocks) {
    const lines = trimEmptyLinesAtEnds(block.split("\n"));
    if (lines.length === 0) continue;

    const header = parseHeaderLine(lines[0]);
    if (!header) continue;

    const text = lines.slice(1).join("\n").trim();

    events.push({
      date: header.date,
      title: header.title,
      text,
    });
  }

  return events;
}
