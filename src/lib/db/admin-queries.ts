import "server-only";
import { createAdminClient } from "@/lib/db/supabase/admin";

// Admin reads use the service role (competitors are owner-only under RLS, but
// staff need names to run the festival). ALWAYS filter by festival_id, and only
// call these after requireFestivalStaff has gated the request. DOB is never
// selected — admin sees names only.

export async function getAdminOverview(festivalId: string, editionId: string) {
  const admin = createAdminClient();
  const [classes, entries, orders] = await Promise.all([
    admin.from("classes").select("status").eq("edition_id", editionId),
    admin.from("entries").select("status").eq("festival_id", festivalId),
    admin.from("orders").select("status, total_pence").eq("festival_id", festivalId),
  ]);
  const classRows = classes.data ?? [];
  const entryRows = entries.data ?? [];
  const orderRows = orders.data ?? [];
  return {
    classesTotal: classRows.length,
    classesPublished: classRows.filter((c) => c.status === "published").length,
    entriesConfirmed: entryRows.filter((e) => e.status === "confirmed").length,
    entriesPending: entryRows.filter(
      (e) => e.status === "basket" || e.status === "pending_payment",
    ).length,
    paidOrders: orderRows.filter((o) => o.status === "paid").length,
    revenuePence: orderRows
      .filter((o) => o.status === "paid")
      .reduce((sum, o) => sum + (o.total_pence ?? 0), 0),
  };
}

export async function getAdminClassById(festivalId: string, classId: string) {
  const admin = createAdminClient();
  const { data } = await admin
    .from("classes")
    .select("*")
    .eq("id", classId)
    .eq("festival_id", festivalId)
    .maybeSingle();
  return data;
}

export async function getAdminClasses(editionId: string) {
  const admin = createAdminClient();
  const { data } = await admin
    .from("classes")
    .select("id, code, title, status, fee_pence, age_min, age_max, disciplines(name)")
    .eq("edition_id", editionId)
    .order("code");
  return data ?? [];
}

export type AdminEntry = {
  id: string;
  status: string;
  code: string;
  classTitle: string;
  competitor: string;
  piece: string | null;
  createdAt: string;
};

export async function getAdminEntries(festivalId: string): Promise<AdminEntry[]> {
  const admin = createAdminClient();
  const { data } = await admin
    .from("entries")
    .select(
      "id, status, piece_title, created_at, classes(code, title), competitors(first_name, last_name)",
    )
    .eq("festival_id", festivalId)
    .order("created_at", { ascending: false });
  return (data ?? []).map((e) => {
    const cls = Array.isArray(e.classes) ? e.classes[0] : e.classes;
    const comp = Array.isArray(e.competitors)
      ? e.competitors[0]
      : e.competitors;
    return {
      id: e.id,
      status: e.status,
      code: cls?.code ?? "",
      classTitle: cls?.title ?? "",
      competitor: comp ? `${comp.first_name} ${comp.last_name}` : "",
      piece: e.piece_title,
      createdAt: e.created_at,
    };
  });
}
