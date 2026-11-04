import { notFound } from "next/navigation";
import Link from "next/link";
import { getFestivalBySlug, getBasketCount } from "@/lib/db/queries";
import { getUser } from "@/lib/auth/user";
import { themeToCssVars, type FestivalTheme } from "@/lib/theme/theme";
import { FestivalHeader } from "@/components/festival/festival-header";

// Festival layout — the white-label boundary. Loads the festival, applies its
// theme overrides as CSS variables on this root, and frames pages with the
// festival header and footer.
export default async function FestivalLayout({
  children,
  params,
}: LayoutProps<"/f/[festivalSlug]">) {
  const { festivalSlug } = await params;
  const festival = await getFestivalBySlug(festivalSlug);
  if (!festival) notFound();

  const theme = (festival.theme ?? {}) as unknown as FestivalTheme;
  const user = await getUser();
  const basketCount = user ? await getBasketCount(festival.id) : 0;

  return (
    <div
      data-festival={festival.slug}
      style={themeToCssVars(theme)}
      className="flex min-h-full flex-1 flex-col bg-bg-page text-text-primary"
    >
      <FestivalHeader
        festivalName={festival.name}
        slug={festival.slug}
        basketCount={basketCount}
      />
      <div className="flex flex-1 flex-col">{children}</div>
      <footer className="border-t border-border-default bg-bg-surface px-lg py-lg">
        <div className="mx-auto flex w-full max-w-3xl flex-wrap items-center justify-between gap-md">
          <Link
            href={`/f/${festival.slug}/contact`}
            className="text-sm text-brand-primary hover:underline"
          >
            Need help? Contact the festival
          </Link>
          <span className="text-sm text-text-secondary">Powered by Mereth</span>
        </div>
      </footer>
    </div>
  );
}
