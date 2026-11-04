import type { Metadata } from "next";
import Link from "next/link";
import { getFestivals } from "@/lib/db/queries";

export const metadata: Metadata = {
  title: "Mereth",
  description: "Entries, timetables and results for music festivals.",
};

// Mereth platform root — a simple directory of festivals (each has its own site
// at /f/[slug]). The public-facing Mereth marketing site is out of scope for now.
export default async function Home() {
  const festivals = await getFestivals();

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-xl px-lg py-2xl">
      <div className="flex flex-col gap-sm">
        <span className="text-xs font-bold uppercase tracking-[1.2px] text-text-secondary">
          Mereth
        </span>
        <h1 className="text-4xl font-semibold">Festivals</h1>
        <p className="text-lg text-text-secondary">
          Entries, timetables and results for UK music festivals.
        </p>
      </div>

      {festivals.length === 0 ? (
        <p className="text-text-secondary">No festivals yet.</p>
      ) : (
        <div className="flex flex-col gap-sm">
          {festivals.map((f) => (
            <Link
              key={f.id}
              href={`/f/${f.slug}`}
              className="flex items-center justify-between gap-md rounded-lg border border-border-default bg-bg-surface p-md transition-colors hover:border-brand-primary"
            >
              <span className="font-heading text-lg font-medium text-text-heading">
                {f.name}
              </span>
              <span className="text-sm font-bold text-brand-primary">Open →</span>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
