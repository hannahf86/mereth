import { describe, it, expect } from "vitest";
import {
  generateRunningOrder,
  type OrderableEntry,
} from "./running-order";
import { allocateTimes } from "./timetable";
import { detectClashes, type TimetableSlot } from "./clashes";

const entries: OrderableEntry[] = [
  { id: "c", createdAt: "2026-11-03T10:00:00Z", firstName: "Ava", lastName: "Young" },
  { id: "a", createdAt: "2026-11-01T10:00:00Z", firstName: "Ben", lastName: "Adams" },
  { id: "b", createdAt: "2026-11-02T10:00:00Z", firstName: "Zoe", lastName: "Adams" },
];

describe("generateRunningOrder", () => {
  it("entry_order sorts by createdAt", () => {
    expect(generateRunningOrder(entries, "entry_order").map((e) => e.id)).toEqual([
      "a",
      "b",
      "c",
    ]);
  });

  it("alphabetical sorts by last name then first name", () => {
    expect(
      generateRunningOrder(entries, "alphabetical").map((e) => e.id),
    ).toEqual(["a", "b", "c"]); // Adams/Ben, Adams/Zoe, Young/Ava
  });

  it("random is deterministic for a given seed and keeps all entries", () => {
    const a = generateRunningOrder(entries, "random", 42).map((e) => e.id);
    const b = generateRunningOrder(entries, "random", 42).map((e) => e.id);
    expect(a).toEqual(b);
    expect([...a].sort()).toEqual(["a", "b", "c"]);
  });

  it("does not mutate the input array", () => {
    const input = [...entries];
    generateRunningOrder(input, "alphabetical");
    expect(input.map((e) => e.id)).toEqual(["c", "a", "b"]);
  });
});

describe("allocateTimes", () => {
  it("numbers positions and spaces starts by time limit + changeover", () => {
    const result = allocateTimes(["a", "b", "c"], "2027-03-19T10:00:00Z", 240, 60);
    expect(result.map((r) => r.position)).toEqual([1, 2, 3]);
    expect(result[0].startsAt).toBe("2027-03-19T10:00:00.000Z");
    // 240 + 60 = 300s = 5 minutes between performers
    expect(result[1].startsAt).toBe("2027-03-19T10:05:00.000Z");
    expect(result[2].startsAt).toBe("2027-03-19T10:10:00.000Z");
  });
});

describe("detectClashes", () => {
  const slots: TimetableSlot[] = [
    { entryId: "e1", competitorId: "maya", startsAt: "2027-03-19T10:00:00Z", label: "P12" },
    { entryId: "e2", competitorId: "maya", startsAt: "2027-03-19T10:20:00Z", label: "V14" },
    { entryId: "e3", competitorId: "leo", startsAt: "2027-03-19T10:10:00Z", label: "P16" },
    { entryId: "e4", competitorId: "maya", startsAt: "2027-03-19T14:00:00Z", label: "P16" },
  ];

  it("flags the same competitor scheduled within the buffer", () => {
    const clashes = detectClashes(slots, 30 * 60);
    expect(clashes).toHaveLength(1);
    expect(clashes[0].competitorId).toBe("maya");
    expect(clashes[0].gapSeconds).toBe(20 * 60);
  });

  it("does not flag gaps at or beyond the buffer", () => {
    expect(detectClashes(slots, 20 * 60)).toHaveLength(0);
  });

  it("ignores different competitors at overlapping times", () => {
    const two: TimetableSlot[] = [
      { entryId: "x", competitorId: "a", startsAt: "2027-03-19T10:00:00Z" },
      { entryId: "y", competitorId: "b", startsAt: "2027-03-19T10:05:00Z" },
    ];
    expect(detectClashes(two, 30 * 60)).toHaveLength(0);
  });
});
