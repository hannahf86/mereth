import Link from "next/link";
import { requireFestivalStaff } from "@/lib/auth/staff";
import { getDisciplines } from "@/lib/db/queries";
import { ClassForm } from "@/components/admin/class-form";

export default async function NewClassPage({
  params,
}: PageProps<"/f/[festivalSlug]/admin/syllabus/new">) {
  const { festivalSlug } = await params;
  const { festival } = await requireFestivalStaff(festivalSlug);
  const disciplines = await getDisciplines();

  return (
    <div className="flex flex-col gap-lg">
      <Link
        href={`/f/${festival.slug}/admin/syllabus`}
        className="text-sm text-brand-primary hover:underline"
      >
        ← Back to syllabus
      </Link>
      <h2 className="text-2xl font-semibold">New class</h2>
      <ClassForm festivalSlug={festival.slug} disciplines={disciplines} />
    </div>
  );
}
