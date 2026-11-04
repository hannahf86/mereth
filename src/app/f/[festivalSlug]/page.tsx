import { notFound } from "next/navigation";
import Link from "next/link";
import {
  getFestivalBySlug,
  getLatestEdition,
  getPublishedClasses,
} from "@/lib/db/queries";
import {
  formatFeePence,
  minutesLabel,
  formatDateLong,
  formatDateRange,
  formatDeadline,
} from "@/lib/format";
import { Panel } from "@/components/ui/panel";
import { Badge } from "@/components/ui/badge";
import { Alert } from "@/components/ui/alert";
import { buttonClasses } from "@/components/ui/button";
import {
  SyllabusBrowser,
  type SyllabusClass,
} from "@/components/festival/syllabus-browser";

// P.01 Find a class — the festival home / syllabus. Public (no sign-in).
export default async function FestivalHome({
  params,
}: PageProps<"/f/[festivalSlug]">) {
  const { festivalSlug } = await params;
  const festival = await getFestivalBySlug(festivalSlug);
  if (!festival) notFound();

  const edition = await getLatestEdition(festival.id);
  if (!edition) {
    return (
      <main className="mx-auto w-full max-w-3xl px-lg py-2xl">
        <h1 className="text-3xl font-semibold">Find a class</h1>
        <p className="mt-sm text-text-secondary">
          This festival hasn&apos;t opened entries yet. Please check back soon.
        </p>
      </main>
    );
  }

  const classes = await getPublishedClasses(edition.id);
  const cutoffLabel = formatDateLong(edition.age_cutoff_date);
  const dateRange =
    edition.starts_on && edition.ends_on
      ? formatDateRange(edition.starts_on, edition.ends_on)
      : null;
  const entriesOpen = edition.status === "entries_open";
  const closesShort = edition.entries_close_at
    ? new Intl.DateTimeFormat("en-GB", {
        day: "numeric",
        month: "long",
        timeZone: "Europe/London",
      }).format(new Date(edition.entries_close_at))
    : null;

  const items: SyllabusClass[] = classes.map((c) => {
    const mins = minutesLabel(c.time_limit_seconds);
    const meta =
      c.set_piece_title != null
        ? `${c.set_piece_composer ? c.set_piece_composer + " · " : ""}${c.set_piece_title}\nSet piece${mins ? " · " + mins : ""}`
        : `Own choice${mins ? " · " + mins : ""}`;
    const d = c.disciplines;
    const disciplineName =
      (Array.isArray(d) ? d[0]?.name : d?.name) ?? "";
    return {
      code: c.code,
      disciplineName,
      title: c.title,
      fee: formatFeePence(c.fee_pence),
      meta,
      ageMin: c.age_min,
      ageMax: c.age_max,
      href: `/f/${festival.slug}/classes/${c.code}`,
    };
  });

  const disciplineNames = Array.from(
    new Set(items.map((i) => i.disciplineName).filter(Boolean)),
  ).sort();

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-xl px-lg py-lg">
      {/* Heading */}
      <div className="flex flex-col gap-sm">
        <p className="text-sm text-text-secondary">
          {edition.title}
          {dateRange ? ` · ${dateRange}` : ""}
        </p>
        {entriesOpen && closesShort ? (
          <Badge tone="brand" className="self-start">
            Entries open · Closes {closesShort}
          </Badge>
        ) : null}
        <h1 className="text-3xl font-semibold">Find a class</h1>
        <p className="text-lg text-text-secondary">
          Explore the festival syllabus and find the right performance
          opportunity for your child.
        </p>
      </div>

      {/* Festival intro */}
      <Panel tone="brand">
        <div className="flex flex-col gap-sm">
          <span className="text-xs font-bold uppercase tracking-[1.2px]">
            Welcome to the {edition.year} festival
          </span>
          <h2 className="text-3xl font-semibold text-text-inverse">
            {festival.name}
          </h2>
        </div>
        <p className="text-base">
          Three days of music, feedback and celebration for young performers.
        </p>
        {dateRange ? <p className="font-bold">{dateRange}</p> : null}
        {edition.entries_close_at ? (
          <p className="text-sm">
            Entries close {formatDeadline(edition.entries_close_at)}.
          </p>
        ) : null}
        <div>
          <Link
            href="#syllabus"
            className={buttonClasses("secondary", "md", "w-full sm:w-auto")}
          >
            Browse syllabus
          </Link>
        </div>
      </Panel>

      {/* Browse the syllabus */}
      <div id="syllabus" className="scroll-mt-lg">
        <Panel>
          <div className="flex flex-col gap-sm">
            <h2 className="text-2xl font-semibold">Browse the syllabus</h2>
            <p className="text-base text-text-secondary">
              Filter by instrument and age at the festival cut-off date (
              {cutoffLabel}) — not age today.
            </p>
          </div>
          <SyllabusBrowser
            classes={items}
            disciplines={disciplineNames}
            cutoffLabel={cutoffLabel}
          />
        </Panel>
      </div>

      {/* Before you enter */}
      <Panel>
        <h2 className="text-2xl font-semibold">Before you enter</h2>
        <ol className="flex flex-col gap-sm text-base text-text-secondary">
          <li>1. Choose a class and check eligibility.</li>
          <li>2. Add a competitor and their details.</li>
          <li>3. Review and pay securely.</li>
        </ol>
      </Panel>

      {/* Age eligibility */}
      <Alert tone="info" title="Age eligibility">
        Each class uses age on {cutoffLabel}. We&apos;ll check the competitor&apos;s
        date of birth before entry.
      </Alert>
    </main>
  );
}
