import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getFestivalBySlug, getLatestEdition } from "@/lib/db/queries";
import { formatDateRange, formatDeadline } from "@/lib/format";
import { Panel } from "@/components/ui/panel";
import { Badge } from "@/components/ui/badge";
import { buttonClasses } from "@/components/ui/button";

export async function generateMetadata({
  params,
}: PageProps<"/f/[festivalSlug]">): Promise<Metadata> {
  const { festivalSlug } = await params;
  const festival = await getFestivalBySlug(festivalSlug);
  if (!festival) return { title: "Festival" };
  return {
    title: festival.name,
    description: `Enter, view the timetable and see results for ${festival.name}.`,
  };
}

// Festival home — Mereth-served public site.
export default async function FestivalHome({
  params,
}: PageProps<"/f/[festivalSlug]">) {
  const { festivalSlug } = await params;
  const festival = await getFestivalBySlug(festivalSlug);
  if (!festival) notFound();
  const edition = await getLatestEdition(festival.id);

  const dateRange =
    edition?.starts_on && edition?.ends_on
      ? formatDateRange(edition.starts_on, edition.ends_on)
      : null;
  const entriesOpen = edition?.status === "entries_open";
  const closesShort = edition?.entries_close_at
    ? new Intl.DateTimeFormat("en-GB", {
        day: "numeric",
        month: "long",
        timeZone: "Europe/London",
      }).format(new Date(edition.entries_close_at))
    : null;
  const timetablePublished =
    edition != null &&
    ["timetable_published", "running", "complete"].includes(edition.status);

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-xl px-lg py-lg">
      <Panel tone="brand">
        <span className="text-xs font-bold uppercase tracking-[1.2px]">
          {edition ? `Welcome to the ${edition.year} festival` : "Welcome"}
        </span>
        <h1 className="text-4xl font-semibold text-text-inverse">
          {festival.name}
        </h1>
        <p className="text-base">
          Three days of music, feedback and celebration for young performers.
        </p>
        {dateRange ? <p className="font-bold">{dateRange}</p> : null}
        {entriesOpen && closesShort ? (
          <Badge tone="brand" className="self-start">
            Entries open · Closes {closesShort}
          </Badge>
        ) : null}
        {edition?.entries_close_at && entriesOpen ? (
          <p className="text-sm">
            Entries close {formatDeadline(edition.entries_close_at)}.
          </p>
        ) : null}
        <div className="flex flex-wrap gap-sm">
          <Link
            href={`/f/${festival.slug}/syllabus`}
            className={buttonClasses("secondary", "md")}
          >
            Browse the syllabus
          </Link>
          {timetablePublished ? (
            <Link
              href={`/f/${festival.slug}/timetable`}
              className={buttonClasses("secondary", "md")}
            >
              View the timetable
            </Link>
          ) : null}
        </div>
      </Panel>

      <Panel>
        <h2 className="text-2xl font-semibold">Before you enter</h2>
        <ol className="flex flex-col gap-sm text-base text-text-secondary">
          <li>1. Browse the syllabus and check eligibility.</li>
          <li>2. Add a competitor and their details.</li>
          <li>3. Review and pay securely.</li>
        </ol>
        <div>
          <Link
            href={`/f/${festival.slug}/syllabus`}
            className={buttonClasses("primary", "md")}
          >
            Find a class
          </Link>
        </div>
      </Panel>
    </main>
  );
}
