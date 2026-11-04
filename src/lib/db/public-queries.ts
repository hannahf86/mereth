import "server-only";
import { createAdminClient } from "@/lib/db/supabase/admin";

// Public festival-site reads. Served via the service role with SAFE projections
// only (no DOBs, no contact details). scheduled_classes is staff-only under RLS,
// so the public timetable is projected here deliberately: class + time + room,
// never competitor-level data.
export async function getPublicVenues(festivalId: string, editionId: string) {
  const admin = createAdminClient();
  const { data } = await admin
    .from("venues")
    .select("id, name, edition_id, rooms(name)")
    .eq("festival_id", festivalId)
    .order("name");
  return (data ?? [])
    .filter((v) => v.edition_id === editionId)
    .map((v) => ({
      id: v.id,
      name: v.name,
      rooms: (v.rooms ?? []).map((r) => r.name),
    }));
}

export type PublicResultRow = {
  classCode: string;
  classTitle: string;
  place: number | null;
  mark: number | null;
  award: string | null;
  name: string; // consent-gated; falls back to "Entry N"
};

// Published results, with names shown ONLY where consent was given.
export async function getPublicResults(
  festivalId: string,
  editionId: string,
): Promise<PublicResultRow[]> {
  const admin = createAdminClient();
  const { data } = await admin
    .from("results")
    .select(
      "mark, place, award, entries(running_order_position, classes(code, title, edition_id), competitors(first_name, last_name, results_name_consent))",
    )
    .eq("festival_id", festivalId)
    .eq("status", "published");

  return (data ?? [])
    .map((r) => {
      const entry = Array.isArray(r.entries) ? r.entries[0] : r.entries;
      const cls = entry
        ? Array.isArray(entry.classes)
          ? entry.classes[0]
          : entry.classes
        : null;
      const comp = entry
        ? Array.isArray(entry.competitors)
          ? entry.competitors[0]
          : entry.competitors
        : null;
      const consented = comp?.results_name_consent === true;
      const name = consented
        ? `${comp?.first_name ?? ""} ${comp?.last_name ?? ""}`.trim()
        : `Entry ${entry?.running_order_position ?? ""}`.trim();
      return {
        editionId: cls?.edition_id ?? null,
        classCode: cls?.code ?? "",
        classTitle: cls?.title ?? "",
        place: r.place,
        mark: r.mark,
        award: r.award,
        name,
      };
    })
    .filter((r) => r.editionId === editionId)
    .map(({ editionId: _drop, ...rest }) => rest);
}

export async function getPublicTimetable(festivalId: string, editionId: string) {
  const admin = createAdminClient();
  const { data } = await admin
    .from("scheduled_classes")
    .select(
      "starts_at, classes(code, title, edition_id), sessions(rooms(name, venues(name)))",
    )
    .eq("festival_id", festivalId)
    .order("starts_at");

  return (data ?? [])
    .map((row) => {
      const cls = Array.isArray(row.classes) ? row.classes[0] : row.classes;
      const sess = Array.isArray(row.sessions) ? row.sessions[0] : row.sessions;
      const room = sess
        ? Array.isArray(sess.rooms)
          ? sess.rooms[0]
          : sess.rooms
        : null;
      const venue = room
        ? Array.isArray(room.venues)
          ? room.venues[0]
          : room.venues
        : null;
      return {
        editionId: cls?.edition_id ?? null,
        startsAt: row.starts_at as string,
        code: cls?.code ?? "",
        title: cls?.title ?? "",
        room: room?.name ?? "",
        venue: venue?.name ?? "",
      };
    })
    .filter((r) => r.editionId === editionId);
}
