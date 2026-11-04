import "server-only";
import { createAdminClient } from "@/lib/db/supabase/admin";

// Public festival-site reads. Served via the service role with SAFE projections
// only (no DOBs, no contact details). scheduled_classes is staff-only under RLS,
// so the public timetable is projected here deliberately: class + time + room,
// never competitor-level data.
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
