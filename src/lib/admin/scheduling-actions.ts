"use server";

import { createClient } from "@/lib/db/supabase/server";
import { createAdminClient } from "@/lib/db/supabase/admin";
import { getFestivalBySlug, getLatestEdition, getMyFestivalRoles } from "@/lib/db/queries";
import {
  generateRunningOrder,
  type OrderMethod,
  type OrderableEntry,
} from "@/lib/domain/scheduling/running-order";
import { allocateTimes } from "@/lib/domain/scheduling/timetable";

const STAFF_ROLES = ["owner", "secretary"];

export type SchedulingResult = { ok: true } | { ok: false; error: string };

async function staffContext(slug: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const festival = await getFestivalBySlug(slug);
  if (!festival) return null;
  const roles = await getMyFestivalRoles(festival.id);
  if (!roles.some((r) => STAFF_ROLES.includes(r))) return null;
  const edition = await getLatestEdition(festival.id);
  return { festival, edition };
}

export async function createSession(
  slug: string,
  input: { roomId: string; startsAt: string; endsAt: string },
): Promise<SchedulingResult> {
  const ctx = await staffContext(slug);
  if (!ctx) return { ok: false, error: "You don't have access to do that." };
  if (!ctx.edition) return { ok: false, error: "This festival has no edition." };
  if (!input.roomId || !input.startsAt || !input.endsAt) {
    return { ok: false, error: "Please choose a room, start and end time." };
  }
  if (new Date(input.endsAt).getTime() <= new Date(input.startsAt).getTime()) {
    return { ok: false, error: "The end time must be after the start time." };
  }
  const admin = createAdminClient();
  const { error } = await admin.from("sessions").insert({
    festival_id: ctx.festival.id,
    edition_id: ctx.edition.id,
    room_id: input.roomId,
    starts_at: input.startsAt,
    ends_at: input.endsAt,
  });
  if (error) return { ok: false, error: "We couldn't create the session." };
  return { ok: true };
}

// Generates a running order for a class and places it in a session at a start
// time. Orders live entries, allocates times (time limit + changeover), writes
// scheduled_classes and each entry's position/time.
export async function scheduleClass(
  slug: string,
  input: {
    classId: string;
    sessionId: string;
    startsAt: string;
    method: OrderMethod;
    changeoverSeconds: number;
  },
): Promise<SchedulingResult> {
  const ctx = await staffContext(slug);
  if (!ctx) return { ok: false, error: "You don't have access to do that." };
  const admin = createAdminClient();

  const { data: cls } = await admin
    .from("classes")
    .select("id, time_limit_seconds")
    .eq("id", input.classId)
    .eq("festival_id", ctx.festival.id)
    .maybeSingle();
  if (!cls) return { ok: false, error: "Class not found." };

  // Live entries only (not withdrawn/refunded).
  const { data: entryRows } = await admin
    .from("entries")
    .select("id, created_at, competitors(first_name, last_name)")
    .eq("class_id", input.classId)
    .not("status", "in", "(withdrawn,refunded)");

  const orderable: OrderableEntry[] = (entryRows ?? []).map((e) => {
    const comp = Array.isArray(e.competitors) ? e.competitors[0] : e.competitors;
    return {
      id: e.id,
      createdAt: e.created_at,
      firstName: comp?.first_name ?? "",
      lastName: comp?.last_name ?? "",
    };
  });

  const ordered = generateRunningOrder(orderable, input.method, 1);
  const allocated = allocateTimes(
    ordered.map((e) => e.id),
    input.startsAt,
    cls.time_limit_seconds ?? 300,
    input.changeoverSeconds,
  );

  const { error: schedError } = await admin
    .from("scheduled_classes")
    .upsert(
      {
        festival_id: ctx.festival.id,
        class_id: input.classId,
        session_id: input.sessionId,
        starts_at: input.startsAt,
      },
      { onConflict: "class_id" },
    );
  if (schedError) {
    return { ok: false, error: "We couldn't schedule this class." };
  }

  await Promise.all(
    allocated.map((a) =>
      admin
        .from("entries")
        .update({ running_order_position: a.position, scheduled_time: a.startsAt })
        .eq("id", a.id),
    ),
  );

  return { ok: true };
}

export async function publishTimetable(slug: string): Promise<SchedulingResult> {
  const ctx = await staffContext(slug);
  if (!ctx) return { ok: false, error: "You don't have access to do that." };
  if (!ctx.edition) return { ok: false, error: "This festival has no edition." };
  const admin = createAdminClient();
  const { error } = await admin
    .from("festival_editions")
    .update({ status: "timetable_published" })
    .eq("id", ctx.edition.id);
  if (error) return { ok: false, error: "We couldn't publish the timetable." };
  return { ok: true };
}
