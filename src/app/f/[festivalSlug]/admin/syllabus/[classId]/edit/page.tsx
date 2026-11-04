import { notFound } from "next/navigation";
import Link from "next/link";
import { requireFestivalStaff } from "@/lib/auth/staff";
import { getDisciplines } from "@/lib/db/queries";
import { getAdminClassById } from "@/lib/db/admin-queries";
import {
  ClassForm,
  type ClassFormValues,
} from "@/components/admin/class-form";

export default async function EditClassPage({
  params,
}: PageProps<"/f/[festivalSlug]/admin/syllabus/[classId]/edit">) {
  const { festivalSlug, classId } = await params;
  const { festival } = await requireFestivalStaff(festivalSlug);
  const cls = await getAdminClassById(festival.id, classId);
  if (!cls) notFound();
  const disciplines = await getDisciplines();

  const initial: Partial<ClassFormValues> = {
    code: cls.code,
    title: cls.title,
    description: cls.description ?? "",
    disciplineId: cls.discipline_id,
    ageMin: cls.age_min?.toString() ?? "",
    ageMax: cls.age_max?.toString() ?? "",
    feePounds: (cls.fee_pence / 100).toString(),
    timeLimitMinutes: cls.time_limit_seconds
      ? (cls.time_limit_seconds / 60).toString()
      : "",
    accompanist: cls.accompanist,
    setPieceTitle: cls.set_piece_title ?? "",
    setPieceComposer: cls.set_piece_composer ?? "",
    maxEntries: cls.max_entries?.toString() ?? "",
    isGroup: cls.is_group,
    status: cls.status,
  };

  return (
    <div className="flex flex-col gap-lg">
      <Link
        href={`/f/${festival.slug}/admin/syllabus`}
        className="text-sm text-brand-primary hover:underline"
      >
        ← Back to syllabus
      </Link>
      <h2 className="text-2xl font-semibold">Edit {cls.code}</h2>
      <ClassForm
        festivalSlug={festival.slug}
        disciplines={disciplines}
        classId={cls.id}
        initial={initial}
      />
    </div>
  );
}
