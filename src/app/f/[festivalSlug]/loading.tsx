// Suspense fallback for the festival segment. Also satisfies Cache Components'
// requirement that request-time (dynamic) content sit under a Suspense boundary.
export default function FestivalLoading() {
  return (
    <div className="mx-auto w-full max-w-3xl px-md py-2xl" aria-busy="true">
      <div className="h-8 w-48 animate-pulse rounded-md bg-bg-subtle" />
      <div className="mt-sm h-4 w-64 animate-pulse rounded-md bg-bg-subtle" />
    </div>
  );
}
