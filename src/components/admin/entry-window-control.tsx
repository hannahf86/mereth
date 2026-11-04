"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Alert } from "@/components/ui/alert";
import { setEntryWindow } from "@/lib/admin/festival-actions";

const STATUS_OPTIONS: [string, string][] = [
  ["draft", "Draft"],
  ["entries_open", "Entries open"],
  ["entries_closed", "Entries closed"],
  ["scheduling", "Scheduling"],
  ["timetable_published", "Timetable published"],
  ["running", "Running"],
  ["complete", "Complete"],
];

const fieldClass =
  "min-h-[44px] w-full rounded-md border border-border-default bg-bg-surface px-md py-sm text-base text-text-primary";
const labelClass = "text-sm font-bold tracking-[0.1px] text-text-primary";

// ISO → value for <input type="datetime-local"> (browser local time).
function toLocalInput(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours(),
  )}:${pad(d.getMinutes())}`;
}

export function EntryWindowControl({
  festivalSlug,
  status: initialStatus,
  entriesOpenAt,
  entriesCloseAt,
}: {
  festivalSlug: string;
  status: string;
  entriesOpenAt: string | null;
  entriesCloseAt: string | null;
}) {
  const router = useRouter();
  const [status, setStatus] = useState(initialStatus);
  const [openAt, setOpenAt] = useState(toLocalInput(entriesOpenAt));
  const [closeAt, setCloseAt] = useState(toLocalInput(entriesCloseAt));
  const [state, setState] = useState<"idle" | "busy" | "saved" | "error">(
    "idle",
  );
  const [error, setError] = useState("");

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setState("busy");
    const res = await setEntryWindow(festivalSlug, {
      status,
      entriesOpenAt: openAt ? new Date(openAt).toISOString() : null,
      entriesCloseAt: closeAt ? new Date(closeAt).toISOString() : null,
    });
    if (res.ok) {
      setState("saved");
      router.refresh();
    } else {
      setError(res.error);
      setState("error");
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="flex flex-col gap-md rounded-lg border border-border-default bg-bg-surface p-lg"
    >
      <h3 className="font-heading text-lg font-semibold text-text-heading">
        Entry window
      </h3>
      <Select
        id="edition-status"
        label="Edition status"
        value={status}
        onChange={(e) => setStatus(e.target.value)}
      >
        {STATUS_OPTIONS.map(([v, l]) => (
          <option key={v} value={v}>
            {l}
          </option>
        ))}
      </Select>
      <div className="grid grid-cols-1 gap-md sm:grid-cols-2">
        <div className="flex flex-col gap-xs">
          <label htmlFor="openAt" className={labelClass}>
            Entries open from
          </label>
          <input
            id="openAt"
            type="datetime-local"
            className={fieldClass}
            value={openAt}
            onChange={(e) => setOpenAt(e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-xs">
          <label htmlFor="closeAt" className={labelClass}>
            Entries close
          </label>
          <input
            id="closeAt"
            type="datetime-local"
            className={fieldClass}
            value={closeAt}
            onChange={(e) => setCloseAt(e.target.value)}
          />
        </div>
      </div>
      {state === "error" ? (
        <Alert tone="error" title="We couldn&apos;t update that">
          {error}
        </Alert>
      ) : null}
      {state === "saved" ? (
        <Alert tone="success" title="Updated">
          The entry window is updated.
        </Alert>
      ) : null}
      <div>
        <Button type="submit" disabled={state === "busy"}>
          {state === "busy" ? "Saving…" : "Save entry window"}
        </Button>
      </div>
    </form>
  );
}
