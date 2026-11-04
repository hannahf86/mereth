import { requireFestivalStaff } from "@/lib/auth/staff";
import { getAdminOverview } from "@/lib/db/admin-queries";
import { formatFeePence } from "@/lib/format";

// A.01-ish — admin overview.
export default async function AdminOverview({
  params,
}: PageProps<"/f/[festivalSlug]/admin">) {
  const { festivalSlug } = await params;
  const { festival, edition } = await requireFestivalStaff(festivalSlug);
  if (!edition) {
    return <p className="text-text-secondary">No edition yet.</p>;
  }
  const o = await getAdminOverview(festival.id, edition.id);

  const stats: { label: string; value: string | number }[] = [
    { label: "Published classes", value: `${o.classesPublished}/${o.classesTotal}` },
    { label: "Confirmed entries", value: o.entriesConfirmed },
    { label: "In progress", value: o.entriesPending },
    { label: "Paid orders", value: o.paidOrders },
    { label: "Revenue", value: formatFeePence(o.revenuePence) },
  ];

  return (
    <div className="flex flex-col gap-lg">
      <h2 className="text-2xl font-semibold">Overview · {edition.title}</h2>
      <div className="grid grid-cols-2 gap-md sm:grid-cols-3">
        {stats.map((s) => (
          <div
            key={s.label}
            className="flex flex-col gap-2xs rounded-lg border border-border-default bg-bg-surface p-lg"
          >
            <span className="text-sm text-text-secondary">{s.label}</span>
            <span className="font-heading text-3xl font-semibold text-text-heading">
              {s.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
