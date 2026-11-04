// Admin dashboard — placeholder. Replaced in step 5 (A.01 festival setup etc.).
export default async function AdminHome({
  params,
}: PageProps<"/f/[festivalSlug]/admin">) {
  const { festivalSlug } = await params;
  return (
    <main className="mx-auto w-full max-w-5xl px-md py-2xl">
      <h1 className="text-3xl font-semibold">Admin · {festivalSlug}</h1>
      <p className="mt-sm text-text-secondary">
        Festival setup, syllabus, entries and scheduling will live here.
      </p>
    </main>
  );
}
