import { NextResponse } from "next/server";
import { getFestivalBySlug, getMyFestivalRoles } from "@/lib/db/queries";
import { getAdminEntries } from "@/lib/db/admin-queries";

const STAFF_ROLES = ["owner", "secretary"];

function csvCell(value: string): string {
  return `"${value.replace(/"/g, '""')}"`;
}

// Entries CSV export — staff only, names only (no dates of birth).
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ festivalSlug: string }> },
) {
  const { festivalSlug } = await params;
  const festival = await getFestivalBySlug(festivalSlug);
  if (!festival) return new NextResponse("Not found", { status: 404 });

  const roles = await getMyFestivalRoles(festival.id);
  if (!roles.some((r) => STAFF_ROLES.includes(r))) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  const entries = await getAdminEntries(festival.id);
  const header = [
    "Class code",
    "Class",
    "Competitor",
    "Status",
    "Piece",
    "Created",
  ];
  const rows = entries.map((e) => [
    e.code,
    e.classTitle,
    e.competitor,
    e.status,
    e.piece ?? "",
    e.createdAt,
  ]);
  const csv = [header, ...rows]
    .map((row) => row.map((c) => csvCell(String(c))).join(","))
    .join("\r\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="entries-${festival.slug}.csv"`,
    },
  });
}
