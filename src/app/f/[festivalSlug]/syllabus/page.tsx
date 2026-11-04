import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  getFestivalBySlug,
  getLatestEdition,
  getPublishedClasses,
} from "@/lib/db/queries";
import { formatFeePence, minutesLabel, formatDateLong } from "@/lib/format";
import { Panel } from "@/components/ui/panel";
import { Alert } from "@/components/ui/alert";
import {
  SyllabusBrowser,
  type SyllabusClass,
} from "@/components/festival/syllabus-browser";

export async function generateMetadata({
  params,
}: PageProps<"/f/[festivalSlug]/syllabus">): Promise<Metadata> {
  const { festivalSlug } = await params;
  const festival = await getFestivalBySlug(festivalSlug);
  return {
    title: festival ? `Syllabus · ${festival.name}` : "Syllabus",
    description: festival
      ? `Browse classes and check eligibility for ${festival.name}.`
      : undefined,
  };
}

// P.01 Find a class — the syllabus. Public.
export default async function SyllabusPage({
  params,
}: PageProps<"/f/[festivalSlug]/syllabus">) {
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

  const items: SyllabusClass[] = classes.map((c) => {
    const mins = minutesLabel(c.time_limit_seconds);
    const meta =
      c.set_piece_title != null
        ? `${c.set_piece_composer ? c.set_piece_composer + " · " : ""}${c.set_piece_title}\nSet piece${mins ? " · " + mins : ""}`
        : `Own choice${mins ? " · " + mins : ""}`;
    const d = c.disciplines;
    const disciplineName = (Array.isArray(d) ? d[0]?.name : d?.name) ?? "";
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
      <div className="flex flex-col gap-sm">
        <h1 className="text-3xl font-semibold">Find a class</h1>
        <p className="text-lg text-text-secondary">
          Filter by instrument and age at the festival cut-off date ({cutoffLabel})
          — not age today.
        </p>
      </div>
      <Panel>
        <SyllabusBrowser
          classes={items}
          disciplines={disciplineNames}
          cutoffLabel={cutoffLabel}
        />
      </Panel>
      <Alert tone="info" title="Age eligibility">
        Each class uses age on {cutoffLabel}. We&apos;ll check the
        competitor&apos;s date of birth before entry.
      </Alert>
    </main>
  );
}
