import Link from "next/link";
import { buttonClasses } from "@/components/ui/button";

// Festival header — the festival name links home; the public pages sit in the nav.
const NAV = [
  { seg: "syllabus", label: "Syllabus" },
  { seg: "timetable", label: "Timetable" },
  { seg: "results", label: "Results" },
  { seg: "venues", label: "Venues" },
];

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
    <header className="flex flex-wrap items-center justify-between gap-md border-b border-border-default bg-bg-surface px-lg py-md">
      <Link
        href={`/f/${slug}`}
        className="rounded-sm bg-bg-subtle px-sm py-xs text-xs font-bold uppercase tracking-[1.2px] text-text-secondary"
      >
        {festivalName}
      </Link>
      <nav className="flex flex-wrap items-center gap-md">
        {NAV.map((n) => (
          <Link
            key={n.seg}
            href={`/f/${slug}/${n.seg}`}
            className="text-sm font-bold text-brand-primary hover:underline"
          >
            {n.label}
          </Link>
        ))}
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
