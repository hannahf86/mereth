import { notFound } from "next/navigation";
import { getFestivalBySlug, getLatestEdition } from "@/lib/db/queries";
import { getPublicTimetable } from "@/lib/db/public-queries";
import { Panel } from "@/components/ui/panel";
import { Alert } from "@/components/ui/alert";

function dayLabel(iso: string) {
  return new Intl.DateTimeFormat("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: "Europe/London",
  }).format(new Date(iso));
}
function timeLabel(iso: string) {
  return new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Europe/London",
  }).format(new Date(iso));
}

// Public timetable — generated from the published schedule. No competitor data.
export default async function TimetablePage({
  params,
}: PageProps<"/f/[festivalSlug]/timetable">) {
  const { festivalSlug } = await params;
  const festival = await getFestivalBySlug(festivalSlug);
  if (!festival) notFound();
  const edition = await getLatestEdition(festival.id);
  const published =
    edition?.status === "timetable_published" ||
    edition?.status === "running" ||
    edition?.status === "complete";

  const rows =
    edition && published
      ? await getPublicTimetable(festival.id, edition.id)
      : [];

  const byDay = new Map<string, typeof rows>();
  for (const r of rows) {
    const d = dayLabel(r.startsAt);
    const list = byDay.get(d) ?? [];
    list.push(r);
    byDay.set(d, list);
  }

  return (
    <main className="mx-auto flex w-full max-w-[42rem] flex-col gap-xl px-lg py-lg">
      <div className="flex flex-col gap-sm">
        <h1 className="text-3xl font-semibold">Timetable</h1>
        {edition ? (
          <p className="text-lg text-text-secondary">{edition.title}</p>
        ) : null}
      </div>

      {!published ? (
        <Alert tone="info" title="Not published yet">
          The timetable will appear here once the festival publishes it.
        </Alert>
      ) : rows.length === 0 ? (
        <Alert tone="info" title="Nothing scheduled yet">
          No classes have been scheduled.
        </Alert>
      ) : (
        [...byDay.entries()].map(([day, items]) => (
          <Panel key={day}>
            <h2 className="text-2xl font-semibold">{day}</h2>
            <div className="flex flex-col gap-sm">
              {items.map((r, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between gap-md border-b border-border-default pb-sm last:border-0 last:pb-0"
                >
                  <div className="flex flex-col">
                    <span className="font-heading text-lg font-medium text-text-heading">
                      <span className="text-brand-accent">{r.code}</span>{" "}
                      {r.title}
                    </span>
                    <span className="text-sm text-text-secondary">
                      {r.venue} · {r.room}
                    </span>
                  </div>
                  <span className="shrink-0 text-base font-bold">
                    {timeLabel(r.startsAt)}
                  </span>
                </div>
              ))}
            </div>
          </Panel>
        ))
      )}
    </main>
  );
}
