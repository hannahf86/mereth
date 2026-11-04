import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getFestivalBySlug, getLatestEdition } from "@/lib/db/queries";
import { getPublicResults } from "@/lib/db/public-queries";
import { Panel } from "@/components/ui/panel";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";

export async function generateMetadata({
  params,
}: PageProps<"/f/[festivalSlug]/results">): Promise<Metadata> {
  const { festivalSlug } = await params;
  const festival = await getFestivalBySlug(festivalSlug);
  return {
    title: festival ? `Results · ${festival.name}` : "Results",
    description: festival ? `Results for ${festival.name}.` : undefined,
  };
}

// Public results — published only; names shown only where consent was given.
export default async function ResultsPage({
  params,
}: PageProps<"/f/[festivalSlug]/results">) {
  const { festivalSlug } = await params;
  const festival = await getFestivalBySlug(festivalSlug);
  if (!festival) notFound();
  const edition = await getLatestEdition(festival.id);
  const rows = edition ? await getPublicResults(festival.id, edition.id) : [];

  // Group by class.
  const byClass = new Map<string, typeof rows>();
  for (const r of rows) {
    const key = `${r.classCode} ${r.classTitle}`;
    const list = byClass.get(key) ?? [];
    list.push(r);
    byClass.set(key, list);
  }

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-xl px-lg py-lg">
      <h1 className="text-3xl font-semibold">Results</h1>
      {rows.length === 0 ? (
        <Alert tone="info" title="Not published yet">
          Results will appear here once the festival publishes them.
        </Alert>
      ) : (
        [...byClass.entries()].map(([cls, items]) => (
          <Panel key={cls}>
            <h2 className="text-2xl font-semibold">{cls}</h2>
            <div className="flex flex-col gap-sm">
              {items
                .slice()
                .sort((a, b) => (a.place ?? 99) - (b.place ?? 99))
                .map((r, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between gap-md border-b border-border-default pb-sm last:border-0 last:pb-0"
                  >
                    <div className="flex items-center gap-sm">
                      {r.place ? <Badge tone="accent">{r.place}</Badge> : null}
                      <span className="text-base">{r.name}</span>
                    </div>
                    <span className="text-sm text-text-secondary">
                      {r.mark != null ? `${r.mark} marks` : ""}
                      {r.award ? ` · ${r.award}` : ""}
                    </span>
                  </div>
                ))}
            </div>
          </Panel>
        ))
      )}
    </main>
  );
}
