import { describe, it, expect } from "vitest";
import { ageOn } from "./age";
import {
  checkEligibility,
  isAgeEligible,
  ageRangeLabel,
  eligibleClasses,
} from "./eligibility";

// Alderford 2027 cut-off from the brief.
const CUTOFF = "2026-09-01";

describe("ageOn", () => {
  it("counts whole years on the cutoff", () => {
    expect(ageOn("2014-09-01", CUTOFF)).toBe(12); // birthday on the cutoff
    expect(ageOn("2014-09-02", CUTOFF)).toBe(11); // day after → not yet 12
    expect(ageOn("2014-08-31", CUTOFF)).toBe(12);
  });

  it("uses the cutoff date, not today", () => {
    // A child born 2015-10-10 is 10 on 2026-09-01 regardless of the current date.
    expect(ageOn("2015-10-10", CUTOFF)).toBe(10);
  });

  it("handles a leap-day birth date", () => {
    expect(ageOn("2016-02-29", "2026-02-28")).toBe(9);
    expect(ageOn("2016-02-29", "2026-03-01")).toBe(10);
  });

  it("accepts Date objects (read as UTC calendar dates)", () => {
    expect(ageOn(new Date("2014-09-01"), new Date("2026-09-01"))).toBe(12);
  });

  it("rejects malformed strings", () => {
    expect(() => ageOn("01/09/2014", CUTOFF)).toThrow();
  });
});

describe("isAgeEligible", () => {
  it("treats null max as no upper limit and null min as from 0", () => {
    expect(isAgeEligible(40, null, null)).toBe(true);
    expect(isAgeEligible(12, null, 12)).toBe(true);
    expect(isAgeEligible(13, null, 12)).toBe(false);
    expect(isAgeEligible(8, 10, null)).toBe(false);
  });
});

describe("ageRangeLabel", () => {
  it("formats ranges in British style", () => {
    expect(ageRangeLabel(null, 12)).toBe("12 & under");
    expect(ageRangeLabel(14, 16)).toBe("14–16");
    expect(ageRangeLabel(8, null)).toBe("8 and over");
  });
});

describe("checkEligibility", () => {
  it("passes a 12-year-old into a 12 & under class", () => {
    const r = checkEligibility({ dob: "2014-10-01", cutoff: CUTOFF, ageMin: null, ageMax: 12 });
    expect(r.eligible).toBe(true);
    expect(r.age).toBe(11);
  });

  it("blocks an over-age competitor with a clear reason", () => {
    const r = checkEligibility({ dob: "2010-01-01", cutoff: CUTOFF, ageMin: null, ageMax: 12 });
    expect(r.eligible).toBe(false);
    if (!r.eligible) {
      expect(r.age).toBe(16);
      expect(r.reason).toContain("12 & under");
    }
  });
});

describe("eligibleClasses", () => {
  it("returns only the classes the age fits", () => {
    const classes = [
      { code: "P12", ageMin: null, ageMax: 12 },
      { code: "P16", ageMin: null, ageMax: 16 },
      { code: "POPEN", ageMin: 18, ageMax: null },
    ];
    expect(eligibleClasses(13, classes).map((c) => c.code)).toEqual(["P16"]);
  });
});
