"use client";

import { useMemo, useState } from "react";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ClassCard } from "@/components/festival/class-card";
import { isAgeEligible } from "@/lib/domain/eligibility/eligibility";

// A syllabus class, flattened and serialisable for the client.
export type SyllabusClass = {
  code: string;
  disciplineName: string;
  title: string;
  fee: string;
  meta: string | null;
  ageMin: number | null;
  ageMax: number | null;
  href: string;
};

// Age options for the "age at cut-off" filter.
const AGES = Array.from({ length: 16 }, (_, i) => i + 3); // 3–18

export function SyllabusBrowser({
  classes,
  disciplines,
  cutoffLabel,
}: {
  classes: SyllabusClass[];
  disciplines: string[];
  cutoffLabel: string;
}) {
  const [instrument, setInstrument] = useState("all");
  const [age, setAge] = useState("all");

  const filtered = useMemo(
    () =>
      classes.filter((c) => {
        if (instrument !== "all" && c.disciplineName !== instrument)
          return false;
        if (age !== "all" && !isAgeEligible(Number(age), c.ageMin, c.ageMax))
          return false;
        return true;
      }),
    [classes, instrument, age],
  );

  const hasFilters = instrument !== "all" || age !== "all";

  return (
    <div className="flex flex-col gap-lg">
      <div className="flex flex-col gap-lg sm:flex-row">
        <Select
          label="Instrument"
          id="filter-instrument"
          value={instrument}
          onChange={(e) => setInstrument(e.target.value)}
        >
          <option value="all">All instruments</option>
          {disciplines.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </Select>
        <Select
          label={`Age at ${cutoffLabel}`}
          id="filter-age"
          value={age}
          onChange={(e) => setAge(e.target.value)}
        >
          <option value="all">All ages</option>
          {AGES.map((a) => (
            <option key={a} value={a}>
              {a} years
            </option>
          ))}
        </Select>
      </div>

      <div className="flex items-center justify-between gap-md">
        <p className="text-sm text-text-secondary" aria-live="polite">
          {filtered.length} class{filtered.length === 1 ? "" : "es"}
          {hasFilters ? " match your filters" : ""}
        </p>
        {hasFilters ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setInstrument("all");
              setAge("all");
            }}
          >
            Clear filters
          </Button>
        ) : null}
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border-default p-lg text-center text-text-secondary">
          No classes match these filters. Try a different instrument or age.
        </div>
      ) : (
        <div className="flex flex-col gap-sm">
          {filtered.map((c) => (
            <ClassCard
              key={c.code}
              href={c.href}
              code={c.code}
              discipline={c.disciplineName}
              title={c.title}
              fee={c.fee}
              meta={c.meta}
            />
          ))}
        </div>
      )}
    </div>
  );
}
