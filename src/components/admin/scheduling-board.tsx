"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  createSession,
  scheduleClass,
  publishTimetable,
} from "@/lib/admin/scheduling-actions";
import type { OrderMethod } from "@/lib/domain/scheduling/running-order";

type Room = { id: string; name: string; venue: string };
type Session = {
  id: string;
  startsAt: string;
  endsAt: string;
  room: string;
  venue: string;
};
type SchedClass = {
  id: string;
  code: string;
  title: string;
  entryCount: number;
  scheduledAt: string | null;
};
type ClashView = {
  competitorName: string;
  labelA: string;
  labelB: string;
  gapMinutes: number;
};

const fieldClass =
  "min-h-[44px] w-full rounded-md border border-border-default bg-bg-surface px-md py-sm text-base text-text-primary";
const labelClass = "text-sm font-bold tracking-[0.1px] text-text-primary";

function fmt(iso: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Europe/London",
  }).format(new Date(iso));
}

function CreateSessionForm({
  festivalSlug,
  rooms,
}: {
  festivalSlug: string;
  rooms: Room[];
}) {
  const router = useRouter();
  const [roomId, setRoomId] = useState(rooms[0]?.id ?? "");
  const [startsAt, setStartsAt] = useState("");
  const [endsAt, setEndsAt] = useState("");
  const [state, setState] = useState<"idle" | "busy" | "error">("idle");
  const [error, setError] = useState("");

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setState("busy");
    const res = await createSession(festivalSlug, {
      roomId,
      startsAt: startsAt ? new Date(startsAt).toISOString() : "",
      endsAt: endsAt ? new Date(endsAt).toISOString() : "",
    });
    if (res.ok) {
      setStartsAt("");
      setEndsAt("");
      setState("idle");
      router.refresh();
    } else {
      setError(res.error);
      setState("error");
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-md">
      <Select
        id="session-room"
        label="Room"
        value={roomId}
        onChange={(e) => setRoomId(e.target.value)}
      >
        {rooms.map((r) => (
          <option key={r.id} value={r.id}>
            {r.venue} · {r.name}
          </option>
        ))}
      </Select>
      <div className="grid grid-cols-1 gap-md sm:grid-cols-2">
        <div className="flex flex-col gap-xs">
          <label htmlFor="session-start" className={labelClass}>
            Starts
          </label>
          <input
            id="session-start"
            type="datetime-local"
            className={fieldClass}
            value={startsAt}
            onChange={(e) => setStartsAt(e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-xs">
          <label htmlFor="session-end" className={labelClass}>
            Ends
          </label>
          <input
            id="session-end"
            type="datetime-local"
            className={fieldClass}
            value={endsAt}
            onChange={(e) => setEndsAt(e.target.value)}
          />
        </div>
      </div>
      {state === "error" ? (
        <Alert tone="error" title="We couldn&apos;t add that">
          {error}
        </Alert>
      ) : null}
      <div>
        <Button type="submit" size="sm" disabled={state === "busy"}>
          {state === "busy" ? "Adding…" : "Add session"}
        </Button>
      </div>
    </form>
  );
}

function ClassScheduler({
  festivalSlug,
  cls,
  sessions,
}: {
  festivalSlug: string;
  cls: SchedClass;
  sessions: Session[];
}) {
  const router = useRouter();
  const [sessionId, setSessionId] = useState(sessions[0]?.id ?? "");
  const [startsAt, setStartsAt] = useState("");
  const [method, setMethod] = useState<OrderMethod>("entry_order");
  const [state, setState] = useState<"idle" | "busy" | "error">("idle");
  const [error, setError] = useState("");

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setState("busy");
    const res = await scheduleClass(festivalSlug, {
      classId: cls.id,
      sessionId,
      startsAt: startsAt ? new Date(startsAt).toISOString() : "",
      method,
      changeoverSeconds: 60,
    });
    if (res.ok) {
      setState("idle");
      router.refresh();
    } else {
      setError(res.error);
      setState("error");
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="flex flex-col gap-sm rounded-md border border-border-default p-sm"
    >
      <div className="flex flex-wrap items-center justify-between gap-sm">
        <span>
          <span className="font-bold text-brand-accent">{cls.code}</span>{" "}
          {cls.title}{" "}
          <span className="text-text-secondary">
            · {cls.entryCount} {cls.entryCount === 1 ? "entry" : "entries"}
          </span>
        </span>
        {cls.scheduledAt ? (
          <Badge tone="success">Scheduled · {fmt(cls.scheduledAt)}</Badge>
        ) : (
          <Badge tone="neutral">Not scheduled</Badge>
        )}
      </div>
      <div className="grid grid-cols-1 gap-sm sm:grid-cols-4 sm:items-end">
        <Select
          id={`sess-${cls.id}`}
          label="Session"
          value={sessionId}
          onChange={(e) => setSessionId(e.target.value)}
        >
          {sessions.map((s) => (
            <option key={s.id} value={s.id}>
              {s.room} · {fmt(s.startsAt)}
            </option>
          ))}
        </Select>
        <div className="flex flex-col gap-xs">
          <label htmlFor={`start-${cls.id}`} className={labelClass}>
            Class starts
          </label>
          <input
            id={`start-${cls.id}`}
            type="datetime-local"
            className={fieldClass}
            value={startsAt}
            onChange={(e) => setStartsAt(e.target.value)}
          />
        </div>
        <Select
          id={`method-${cls.id}`}
          label="Order"
          value={method}
          onChange={(e) => setMethod(e.target.value as OrderMethod)}
        >
          <option value="entry_order">Entry order</option>
          <option value="alphabetical">Alphabetical</option>
          <option value="random">Random</option>
        </Select>
        <Button type="submit" size="sm" disabled={state === "busy" || !sessionId}>
          {state === "busy" ? "Generating…" : "Generate order"}
        </Button>
      </div>
      {state === "error" ? (
        <Alert tone="error" title="We couldn&apos;t schedule this">
          {error}
        </Alert>
      ) : null}
    </form>
  );
}

export function SchedulingBoard({
  festivalSlug,
  rooms,
  sessions,
  classes,
  clashes,
  editionStatus,
}: {
  festivalSlug: string;
  rooms: Room[];
  sessions: Session[];
  classes: SchedClass[];
  clashes: ClashView[];
  editionStatus: string;
}) {
  const router = useRouter();
  const [publishing, setPublishing] = useState(false);
  const published = editionStatus === "timetable_published";

  async function publish() {
    setPublishing(true);
    await publishTimetable(festivalSlug);
    router.refresh();
    setPublishing(false);
  }

  return (
    <div className="flex flex-col gap-xl">
      <section className="flex flex-col gap-md">
        <h3 className="font-heading text-lg font-semibold text-text-heading">
          Sessions
        </h3>
        {sessions.length > 0 ? (
          <ul className="flex flex-col gap-2xs text-sm">
            {sessions.map((s) => (
              <li key={s.id} className="text-text-secondary">
                {s.venue} · {s.room} — {fmt(s.startsAt)} to {fmt(s.endsAt)}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-text-secondary">No sessions yet.</p>
        )}
        {rooms.length > 0 ? (
          <CreateSessionForm festivalSlug={festivalSlug} rooms={rooms} />
        ) : (
          <p className="text-sm text-text-secondary">
            Add venues and rooms first.
          </p>
        )}
      </section>

      <section className="flex flex-col gap-md">
        <h3 className="font-heading text-lg font-semibold text-text-heading">
          Classes
        </h3>
        {sessions.length === 0 ? (
          <p className="text-sm text-text-secondary">
            Create a session above, then schedule classes into it.
          </p>
        ) : (
          classes.map((c) => (
            <ClassScheduler
              key={c.id}
              festivalSlug={festivalSlug}
              cls={c}
              sessions={sessions}
            />
          ))
        )}
      </section>

      {clashes.length > 0 ? (
        <Alert tone="warning" title={`${clashes.length} possible clash${clashes.length === 1 ? "" : "es"}`}>
          <ul className="mt-2xs flex flex-col gap-2xs">
            {clashes.map((c, i) => (
              <li key={i}>
                {c.competitorName}: {c.labelA} and {c.labelB}, {c.gapMinutes} min
                apart
              </li>
            ))}
          </ul>
        </Alert>
      ) : null}

      <section className="flex flex-col gap-sm">
        <h3 className="font-heading text-lg font-semibold text-text-heading">
          Timetable
        </h3>
        {published ? (
          <Alert tone="success" title="Timetable published">
            Entrants can now see their times.
          </Alert>
        ) : (
          <p className="text-sm text-text-secondary">
            The timetable is not published yet — entrants can&apos;t see times.
          </p>
        )}
        <div>
          <Button onClick={publish} disabled={publishing || published}>
            {publishing
              ? "Publishing…"
              : published
                ? "Published"
                : "Publish timetable"}
          </Button>
        </div>
      </section>
    </div>
  );
}
