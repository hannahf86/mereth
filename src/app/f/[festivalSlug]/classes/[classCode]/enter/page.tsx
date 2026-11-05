import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { getUser } from "@/lib/auth/user";
import {
  getFestivalBySlug,
  getLatestEdition,
  getPublishedClassByCode,
  getMyCompetitors,
} from "@/lib/db/queries";
import { formatDateLong } from "@/lib/format";
import { Panel } from "@/components/ui/panel";
import { EntryForm } from "@/components/festival/entry-form";

// P.04 Who is performing — auth-gated. Pick/add a competitor and add to basket.
export default async function EnterClass({
  params,
}: PageProps<"/f/[festivalSlug]/classes/[classCode]/enter">) {
  const { festivalSlug, classCode } = await params;
  const festival = await getFestivalBySlug(festivalSlug);
  if (!festival) notFound();

  const user = await getUser();
  if (!user) {
    redirect(`/f/${festival.slug}/sign-in?class=${classCode}`);
  }

  const edition = await getLatestEdition(festival.id);
  if (!edition) notFound();
  const cls = await getPublishedClassByCode(edition.id, classCode);
  if (!cls) notFound();

  const competitors = (await getMyCompetitors()).map((c) => ({
    id: c.id,
    firstName: c.first_name,
    lastName: c.last_name,
    dob: c.date_of_birth,
  }));

  return (
    <main className="mx-auto flex w-full max-w-[42rem] flex-col gap-xl px-lg py-lg">
      <Link
        href={`/f/${festival.slug}/classes/${cls.code}`}
        className="text-sm text-brand-primary hover:underline"
      >
        ← Back to class
      </Link>
      <div className="flex flex-col gap-sm">
        <span className="text-xs font-bold uppercase tracking-[1.2px] text-brand-accent">
          {cls.code}
        </span>
        <h1 className="text-3xl font-semibold">Who is performing?</h1>
        <p className="text-lg text-text-secondary">{cls.title}</p>
      </div>
      <Panel>
        <EntryForm
          festivalSlug={festival.slug}
          classCode={cls.code}
          isSetPiece={cls.set_piece_title != null}
          setPieceTitle={cls.set_piece_title}
          setPieceComposer={cls.set_piece_composer}
          accompanist={cls.accompanist}
          cutoffIso={edition.age_cutoff_date}
          cutoffLabel={formatDateLong(edition.age_cutoff_date)}
          ageMin={cls.age_min}
          ageMax={cls.age_max}
          competitors={competitors}
          photoPolicy={festival.photo_policy}
        />
      </Panel>
    </main>
  );
}
