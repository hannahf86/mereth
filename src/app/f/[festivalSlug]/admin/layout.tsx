import Link from "next/link";
import { requireFestivalStaff } from "@/lib/auth/staff";

// Festival admin shell (secretary / owner) — desktop-first. Gated: non-staff are
// redirected away by requireFestivalStaff.
export default async function AdminLayout({
  children,
  params,
}: LayoutProps<"/f/[festivalSlug]/admin">) {
  const { festivalSlug } = await params;
  const { festival } = await requireFestivalStaff(festivalSlug);
  const base = `/f/${festival.slug}/admin`;
  const nav = [
    { href: base, label: "Overview" },
    { href: `${base}/entries`, label: "Entries" },
    { href: `${base}/syllabus`, label: "Syllabus" },
    { href: `${base}/scheduling`, label: "Scheduling" },
    { href: `${base}/settings`, label: "Settings" },
  ];

  return (
    <div className="mx-auto flex w-full max-w-[72rem] flex-1 flex-col gap-lg px-lg py-lg">
      <div className="flex flex-col gap-2xs">
        <span className="text-xs font-bold uppercase tracking-[1.2px] text-brand-accent">
          Admin
        </span>
        <p className="font-heading text-2xl font-semibold text-text-heading">
          {festival.name}
        </p>
      </div>
      <nav className="flex flex-wrap gap-xs border-b border-border-default pb-sm">
        {nav.map((n) => (
          <Link
            key={n.href}
            href={n.href}
            className="rounded-md px-md py-sm text-sm font-bold text-text-secondary hover:bg-bg-subtle hover:text-brand-primary"
          >
            {n.label}
          </Link>
        ))}
      </nav>
      <div className="flex flex-1 flex-col">{children}</div>
    </div>
  );
}
