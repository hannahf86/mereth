// Clash detection: flag a competitor scheduled in two places within a buffer
// (e.g. 30 minutes), including across different venues/classes.

export interface TimetableSlot {
  entryId: string;
  competitorId: string;
  startsAt: string; // ISO timestamp
  label?: string; // e.g. "P12 · Town Hall", for the warning message
}

export interface Clash {
  competitorId: string;
  a: TimetableSlot;
  b: TimetableSlot;
  gapSeconds: number;
}

export function detectClashes(
  slots: readonly TimetableSlot[],
  bufferSeconds: number,
): Clash[] {
  const byCompetitor = new Map<string, TimetableSlot[]>();
  for (const slot of slots) {
    const list = byCompetitor.get(slot.competitorId) ?? [];
    list.push(slot);
    byCompetitor.set(slot.competitorId, list);
  }

  const clashes: Clash[] = [];
  for (const [competitorId, list] of byCompetitor) {
    const sorted = [...list].sort(
      (a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime(),
    );
    for (let i = 0; i < sorted.length - 1; i++) {
      for (let j = i + 1; j < sorted.length; j++) {
        const gap =
          (new Date(sorted[j].startsAt).getTime() -
            new Date(sorted[i].startsAt).getTime()) /
          1000;
        if (gap < bufferSeconds) {
          clashes.push({ competitorId, a: sorted[i], b: sorted[j], gapSeconds: gap });
        } else {
          // Sorted ascending — any later j is further away, so stop.
          break;
        }
      }
    }
  }
  return clashes;
}
