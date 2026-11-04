import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getFestivalBySlug, getLatestEdition } from "@/lib/db/queries";
import { getPublicVenues } from "@/lib/db/public-queries";
import { Panel } from "@/components/ui/panel";

export async function generateMetadata({
  params,
}: PageProps<"/f/[festivalSlug]/venues">): Promise<Metadata> {
  const { festivalSlug } = await params;
  const festival = await getFestivalBySlug(festivalSlug);
  return {
    title: festival ? `Venues · ${festival.name}` : "Venues",
    description: festival ? `Venues for ${festival.name}.` : undefined,
  };
}

export default async function VenuesPage({
  params,
}: PageProps<"/f/[festivalSlug]/venues">) {
  const { festivalSlug } = await params;
  const festival = await getFestivalBySlug(festivalSlug);
  if (!festival) notFound();
  const edition = await getLatestEdition(festival.id);
  const venues = edition ? await getPublicVenues(festival.id, edition.id) : [];

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-xl px-lg py-lg">
      <h1 className="text-3xl font-semibold">Venues</h1>
      {venues.length === 0 ? (
        <p className="text-text-secondary">
          Venues will be listed here soon.
        </p>
      ) : (
        venues.map((v) => (
          <Panel key={v.id}>
            <h2 className="text-2xl font-semibold">{v.name}</h2>
            {v.rooms.length > 0 ? (
              <ul className="flex flex-col gap-2xs text-base text-text-secondary">
                {v.rooms.map((r) => (
                  <li key={r}>{r}</li>
                ))}
              </ul>
            ) : null}
          </Panel>
        ))
      )}
    </main>
  );
}
