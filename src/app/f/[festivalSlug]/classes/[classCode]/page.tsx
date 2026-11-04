import { notFound } from "next/navigation";
import Link from "next/link";
import {
  getFestivalBySlug,
  getLatestEdition,
  getPublishedClassByCode,
  getPublishedClasses,
} from "@/lib/db/queries";
import { formatFeePence, minutesLabel, formatDateLong } from "@/lib/format";
import { Panel } from "@/components/ui/panel";
import { Badge } from "@/components/ui/badge";
import { ageRangeLabel } from "@/lib/domain/eligibility/eligibility";
import { EligibilityChecker } from "@/components/festival/eligibility-checker";
import { getUser } from "@/lib/auth/user";

const ACCOMPANIST_LABEL: Record<string, string> = {
  not_required: "No accompanist needed",
  optional: "Accompanist optional",
  required: "Accompanist required",
};

function disciplineOf(d: { name: string } | { name: string }[] | null): string {
  return (Array.isArray(d) ? d[0]?.name : d?.name) ?? "";
}

// P.02 Class details — requirements + a date-of-birth eligibility check. Public.
export default async function ClassDetails({
  params,
}: PageProps<"/f/[festivalSlug]/classes/[classCode]">) {
  const { festivalSlug, classCode } = await params;
  const festival = await getFestivalBySlug(festivalSlug);
  if (!festival) notFound();
  const edition = await getLatestEdition(festival.id);
  if (!edition) notFound();
  const cls = await getPublishedClassByCode(edition.id, classCode);
  if (!cls) notFound();

  // Signed-in entrants go straight to the entry form; others sign in first.
  const user = await getUser();
  const enterHref = user
    ? `/f/${festival.slug}/classes/${cls.code}/enter`
    : `/f/${festival.slug}/sign-in?class=${cls.code}`;

  const disciplineName = disciplineOf(cls.disciplines);
  const cutoffLabel = formatDateLong(edition.age_cutoff_date);
  const mins = minutesLabel(cls.time_limit_seconds);

  // Same-discipline published classes → suggestions when not eligible.
  const all = await getPublishedClasses(edition.id);
  const siblings = all
    .filter((c) => disciplineOf(c.disciplines) === disciplineName)
    .map((c) => ({
      code: c.code,
      title: c.title,
      ageMin: c.age_min,
      ageMax: c.age_max,
      href: `/f/${festival.slug}/classes/${c.code}`,
    }));

  const repertoire = cls.set_piece_title
    ? `${cls.set_piece_composer ? cls.set_piece_composer + " · " : ""}${cls.set_piece_title} (set piece)`
    : "Own choice";

  return (
    <main className="mx-auto flex w-full max-w-[42rem] flex-col gap-xl px-lg py-lg">
      <Link
        href={`/f/${festival.slug}`}
        className="text-sm text-brand-primary hover:underline"
      >
        ← Back to all classes
      </Link>

      <div className="flex flex-col gap-sm">
        <span className="text-xs font-bold uppercase tracking-[1.2px] text-brand-accent">
          {cls.code} · {disciplineName}
        </span>
        <h1 className="text-3xl font-semibold">{cls.title}</h1>
        <div className="flex flex-wrap items-center gap-sm">
          <Badge tone="neutral">Ages {ageRangeLabel(cls.age_min, cls.age_max)}</Badge>
          <span className="text-lg font-bold text-text-primary">
            {formatFeePence(cls.fee_pence)}
          </span>
        </div>
      </div>

      <Panel>
        <h2 className="text-2xl font-semibold">What&apos;s involved</h2>
        {cls.description ? (
          <p className="text-base text-text-secondary">{cls.description}</p>
        ) : null}
        <dl className="flex flex-col gap-sm">
          <DetailRow label="Repertoire" value={repertoire} />
          {mins ? <DetailRow label="Time limit" value={mins} /> : null}
          <DetailRow
            label="Accompanist"
            value={ACCOMPANIST_LABEL[cls.accompanist] ?? cls.accompanist}
          />
          <DetailRow label="Entry fee" value={formatFeePence(cls.fee_pence)} />
        </dl>
      </Panel>

      <Panel>
        <div className="flex flex-col gap-sm">
          <h2 className="text-2xl font-semibold">Check eligibility</h2>
          <p className="text-base text-text-secondary">
            Enter the competitor&apos;s date of birth to check they can enter
            this class.
          </p>
        </div>
        <EligibilityChecker
          cutoffIso={edition.age_cutoff_date}
          cutoffLabel={cutoffLabel}
          ageMin={cls.age_min}
          ageMax={cls.age_max}
          thisCode={cls.code}
          siblings={siblings}
          enterHref={enterHref}
        />
      </Panel>
    </main>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-md border-b border-border-default pb-sm last:border-0 last:pb-0">
      <dt className="text-sm text-text-secondary">{label}</dt>
      <dd className="text-right text-sm font-bold text-text-primary">{value}</dd>
    </div>
  );
}
