// Running-order generation for a class. Pure and deterministic (the random
// method is seeded so a generated order is reproducible and auditable).

export type OrderMethod = "entry_order" | "alphabetical" | "random";

export interface OrderableEntry {
  id: string;
  createdAt: string; // ISO timestamp
  firstName: string;
  lastName: string;
}

// mulberry32 — small, fast, deterministic PRNG.
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return function () {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function seededShuffle<T>(items: readonly T[], seed: number): T[] {
  const arr = [...items];
  const rand = mulberry32(seed);
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function generateRunningOrder<T extends OrderableEntry>(
  entries: readonly T[],
  method: OrderMethod,
  seed = 1,
): T[] {
  const list = [...entries];
  switch (method) {
    case "entry_order":
      return list.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
    case "alphabetical":
      return list.sort(
        (a, b) =>
          a.lastName.localeCompare(b.lastName, "en-GB") ||
          a.firstName.localeCompare(b.firstName, "en-GB"),
      );
    case "random":
      return seededShuffle(list, seed);
  }
}
