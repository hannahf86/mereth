import { requireFestivalStaff } from "@/lib/auth/staff";
import {
  getRooms,
  getSessions,
  getSchedulableClasses,
  getScheduledSlots,
} from "@/lib/db/admin-queries";
import {
  detectClashes,
  type TimetableSlot,
} from "@/lib/domain/scheduling/clashes";
import { SchedulingBoard } from "@/components/admin/scheduling-board";

// A.04 — scheduling: sessions, running-order generation, clash detection, publish.
export default async function AdminScheduling({
  params,
}: PageProps<"/f/[festivalSlug]/admin/scheduling">) {
  const { festivalSlug } = await params;
  const { festival, edition } = await requireFestivalStaff(festivalSlug);
  if (!edition) return <p className="text-text-secondary">No edition yet.</p>;

  const [rooms, sessions, classes, slots] = await Promise.all([
    getRooms(festival.id),
    getSessions(festival.id),
    getSchedulableClasses(festival.id, edition.id),
    getScheduledSlots(festival.id),
  ]);

  const nameById = new Map(slots.map((s) => [s.competitorId, s.competitorName]));
  const timetableSlots: TimetableSlot[] = slots.map((s) => ({
    entryId: s.entryId,
    competitorId: s.competitorId,
    startsAt: s.startsAt,
    label: s.label,
  }));
  const clashes = detectClashes(timetableSlots, 30 * 60).map((c) => ({
    competitorName: nameById.get(c.competitorId) ?? "A competitor",
    labelA: c.a.label ?? "",
    labelB: c.b.label ?? "",
    gapMinutes: Math.round(c.gapSeconds / 60),
  }));

  return (
    <div className="flex flex-col gap-lg">
      <h2 className="text-2xl font-semibold">Scheduling</h2>
      <SchedulingBoard
        festivalSlug={festival.slug}
        rooms={rooms}
        sessions={sessions}
        classes={classes}
        clashes={clashes}
        editionStatus={edition.status}
      />
    </div>
  );
}
