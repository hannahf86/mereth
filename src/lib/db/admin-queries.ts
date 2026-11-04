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

export async function getRooms(festivalId: string) {
  const admin = createAdminClient();
  const { data } = await admin
    .from("rooms")
    .select("id, name, venues(name)")
    .eq("festival_id", festivalId)
    .order("name");
  return (data ?? []).map((r) => {
    const v = Array.isArray(r.venues) ? r.venues[0] : r.venues;
    return { id: r.id, name: r.name, venue: v?.name ?? "" };
  });
}

export async function getSessions(festivalId: string) {
  const admin = createAdminClient();
  const { data } = await admin
    .from("sessions")
    .select("id, starts_at, ends_at, rooms(name, venues(name))")
    .eq("festival_id", festivalId)
    .order("starts_at");
  return (data ?? []).map((s) => {
    const room = Array.isArray(s.rooms) ? s.rooms[0] : s.rooms;
    const venue = room
      ? Array.isArray(room.venues)
        ? room.venues[0]
        : room.venues
      : null;
    return {
      id: s.id,
      startsAt: s.starts_at,
      endsAt: s.ends_at,
      room: room?.name ?? "",
      venue: venue?.name ?? "",
    };
  });
}

export async function getSchedulableClasses(
  festivalId: string,
  editionId: string,
) {
  const admin = createAdminClient();
  const { data: classes } = await admin
    .from("classes")
    .select("id, code, title, scheduled_classes(starts_at)")
    .eq("edition_id", editionId)
    .order("code");
  const { data: entries } = await admin
    .from("entries")
    .select("class_id, status")
    .eq("festival_id", festivalId);
  const counts = new Map<string, number>();
  for (const e of entries ?? []) {
    if (e.status !== "withdrawn" && e.status !== "refunded") {
      counts.set(e.class_id, (counts.get(e.class_id) ?? 0) + 1);
    }
  }
  return (classes ?? []).map((c) => {
    const sc = Array.isArray(c.scheduled_classes)
      ? c.scheduled_classes[0]
      : c.scheduled_classes;
    return {
      id: c.id,
      code: c.code,
      title: c.title,
      entryCount: counts.get(c.id) ?? 0,
      scheduledAt: sc?.starts_at ?? null,
    };
  });
}

export type ScheduledSlot = {
  entryId: string;
  competitorId: string;
  competitorName: string;
  startsAt: string;
  label: string;
};

export async function getScheduledSlots(
  festivalId: string,
): Promise<ScheduledSlot[]> {
  const admin = createAdminClient();
  const { data } = await admin
    .from("entries")
    .select("id, competitor_id, scheduled_time, classes(code), competitors(first_name, last_name)")
    .eq("festival_id", festivalId)
    .not("scheduled_time", "is", null)
    .not("status", "in", "(withdrawn,refunded)");
  return (data ?? []).map((e) => {
    const cls = Array.isArray(e.classes) ? e.classes[0] : e.classes;
    const comp = Array.isArray(e.competitors)
      ? e.competitors[0]
      : e.competitors;
    return {
      entryId: e.id,
      competitorId: e.competitor_id,
      competitorName: comp ? `${comp.first_name} ${comp.last_name}` : "",
      startsAt: e.scheduled_time as string,
      label: cls?.code ?? "",
    };
  });
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
