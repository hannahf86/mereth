import Link from "next/link";

// Class card — matches Figma "Class card" (11:32). Syllabus class summary used
// in the list, basket and entries dashboard. Links through to class details.
export function ClassCard({
  href,
  code,
  discipline,
  title,
  fee,
  meta,
}: {
  href: string;
  code: string;
  discipline: string;
  title: string;
  fee: string;
  meta?: string | null;
}) {
  return (
    <Link
      href={href}
      className="flex flex-col gap-xs rounded-lg border border-border-default bg-bg-surface p-md transition-colors hover:border-brand-primary focus-visible:border-brand-primary"
    >
      <div className="flex items-center justify-between gap-md">
        <span className="text-xs font-bold uppercase tracking-[1.2px] text-brand-accent">
          {code} · {discipline}
        </span>
        <span className="shrink-0 text-base text-text-primary">{fee}</span>
      </div>
      <span className="font-heading text-lg font-medium text-text-heading">
        {title}
      </span>
      {meta ? (
        <span className="whitespace-pre-line text-sm text-text-secondary">
          {meta}
        </span>
      ) : null}
    </Link>
  );
}
