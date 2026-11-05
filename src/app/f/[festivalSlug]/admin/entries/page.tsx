import Link from "next/link";
import { requireFestivalStaff } from "@/lib/auth/staff";
import { getAdminEntries } from "@/lib/db/admin-queries";
import { Badge, type BadgeTone } from "@/components/ui/badge";
import { buttonClasses } from "@/components/ui/button";

const STATUS_TONE: Record<string, BadgeTone> = {
  confirmed: "success",
  pending_payment: "warning",
  basket: "neutral",
  withdrawn: "neutral",
  refunded: "error",
};
const STATUS_LABEL: Record<string, string> = {
  confirmed: "Confirmed",
  pending_payment: "Awaiting payment",
  basket: "In basket",
  withdrawn: "Withdrawn",
  refunded: "Refunded",
};

// A.05-ish — entries & payments list with CSV export.
export default async function AdminEntries({
  params,
}: PageProps<"/f/[festivalSlug]/admin/entries">) {
  const { festivalSlug } = await params;
  const { festival } = await requireFestivalStaff(festivalSlug);
  const entries = await getAdminEntries(festival.id);

  return (
    <div className="flex flex-col gap-lg">
      <div className="flex items-center justify-between gap-md">
        <h2 className="text-2xl font-semibold">Entries ({entries.length})</h2>
        {entries.length > 0 ? (
          <Link
            href={`/f/${festival.slug}/admin/entries/export`}
            className={buttonClasses("secondary", "sm")}
          >
            Download CSV
          </Link>
        ) : null}
      </div>

      {entries.length === 0 ? (
        <p className="text-text-secondary">No entries yet.</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border-default">
          <table className="w-full border-collapse text-left text-sm">
            <thead className="bg-bg-subtle">
              <tr>
                <th className="p-sm font-bold">Class</th>
                <th className="p-sm font-bold">Competitor</th>
                <th className="p-sm font-bold">Piece</th>
                <th className="p-sm font-bold">Status</th>
                <th className="p-sm font-bold">Photos</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((e) => (
                <tr key={e.id} className="border-t border-border-default">
                  <td className="p-sm">
                    <span className="font-bold text-brand-accent">{e.code}</span>{" "}
                    {e.classTitle}
                  </td>
                  <td className="p-sm">{e.competitor}</td>
                  <td className="p-sm text-text-secondary">{e.piece ?? "—"}</td>
                  <td className="p-sm">
                    <Badge tone={STATUS_TONE[e.status] ?? "neutral"}>
                      {STATUS_LABEL[e.status] ?? e.status}
                    </Badge>
                  </td>
                  <td className="p-sm">
                    {e.mediaConsent === "granted" ? (
                      <Badge tone="success">Yes</Badge>
                    ) : e.mediaConsent === "refused" ? (
                      <Badge tone="error">No</Badge>
                    ) : (
                      <span className="text-text-secondary">—</span>
                    )}
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
