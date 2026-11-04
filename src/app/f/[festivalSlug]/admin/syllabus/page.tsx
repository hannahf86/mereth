import Link from "next/link";
import { requireFestivalStaff } from "@/lib/auth/staff";
import { getAdminClasses } from "@/lib/db/admin-queries";
import { formatFeePence } from "@/lib/format";
import { ageRangeLabel } from "@/lib/domain/eligibility/eligibility";
import { Badge, type BadgeTone } from "@/components/ui/badge";
import { buttonClasses } from "@/components/ui/button";

const STATUS_TONE: Record<string, BadgeTone> = {
  published: "success",
  draft: "neutral",
  closed: "warning",
  cancelled: "error",
};

// A.02 — syllabus builder (list + create/edit).
export default async function AdminSyllabus({
  params,
}: PageProps<"/f/[festivalSlug]/admin/syllabus">) {
  const { festivalSlug } = await params;
  const { festival, edition } = await requireFestivalStaff(festivalSlug);
  if (!edition) return <p className="text-text-secondary">No edition yet.</p>;
  const classes = await getAdminClasses(edition.id);

  return (
    <div className="flex flex-col gap-lg">
      <div className="flex items-center justify-between gap-md">
        <h2 className="text-2xl font-semibold">Syllabus ({classes.length})</h2>
        <Link
          href={`/f/${festival.slug}/admin/syllabus/new`}
          className={buttonClasses("primary", "sm")}
        >
          New class
        </Link>
      </div>
      {classes.length === 0 ? (
        <p className="text-text-secondary">
          No classes yet. Add your first with “New class”.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border-default">
          <table className="w-full border-collapse text-left text-sm">
            <thead className="bg-bg-subtle">
              <tr>
                <th className="p-sm font-bold">Code</th>
                <th className="p-sm font-bold">Title</th>
                <th className="p-sm font-bold">Ages</th>
                <th className="p-sm font-bold">Fee</th>
                <th className="p-sm font-bold">Status</th>
                <th className="p-sm font-bold" aria-label="Actions" />
              </tr>
            </thead>
            <tbody>
              {classes.map((c) => (
                <tr key={c.id} className="border-t border-border-default">
                  <td className="p-sm font-bold text-brand-accent">{c.code}</td>
                  <td className="p-sm">{c.title}</td>
                  <td className="p-sm text-text-secondary">
                    {ageRangeLabel(c.age_min, c.age_max)}
                  </td>
                  <td className="p-sm">{formatFeePence(c.fee_pence)}</td>
                  <td className="p-sm">
                    <Badge tone={STATUS_TONE[c.status] ?? "neutral"}>
                      {c.status}
                    </Badge>
                  </td>
                  <td className="p-sm text-right">
                    <Link
                      href={`/f/${festival.slug}/admin/syllabus/${c.id}/edit`}
                      className="text-sm font-bold text-brand-primary hover:underline"
                    >
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
