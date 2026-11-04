import Link from "next/link";
import { buttonClasses } from "@/components/ui/button";

// Festival header — matches Figma "Header" (12:102). The logo slot holds the
// festival's name/logo; basket count is wired up with the basket later.
export function FestivalHeader({
  festivalName,
  slug,
  basketCount = 0,
}: {
  festivalName: string;
  slug: string;
  basketCount?: number;
}) {
  return (
    <header className="flex items-center justify-between border-b border-border-default bg-bg-surface px-lg py-md">
      <Link
        href={`/f/${slug}`}
        className="rounded-sm bg-bg-subtle px-sm py-xs text-xs font-bold uppercase tracking-[1.2px] text-text-secondary"
      >
        {festivalName}
      </Link>
      <nav className="flex items-center gap-md">
        <Link
          href={`/f/${slug}/timetable`}
          className="text-sm font-bold text-brand-primary hover:underline"
        >
          Timetable
        </Link>
        <Link
          href={`/f/${slug}/basket`}
          className={buttonClasses("secondary", "sm")}
        >
          Basket ({basketCount})
        </Link>
      </nav>
    </header>
  );
}
