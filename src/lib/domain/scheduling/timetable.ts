// Allocate start times to an ordered list of entries within a session, using the
// class time limit plus a configurable changeover interval between performers.

export interface AllocatedEntry {
  id: string;
  position: number; // 1-based running-order position
  startsAt: string; // ISO timestamp
}

export function allocateTimes(
  orderedIds: readonly string[],
  sessionStartIso: string,
  timeLimitSeconds: number,
  changeoverSeconds: number,
): AllocatedEntry[] {
  const start = new Date(sessionStartIso).getTime();
  const slotMs = (timeLimitSeconds + changeoverSeconds) * 1000;
  return orderedIds.map((id, index) => ({
    id,
    position: index + 1,
    startsAt: new Date(start + index * slotMs).toISOString(),
  }));
}
