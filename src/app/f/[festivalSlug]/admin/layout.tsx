// Festival admin shell (secretary / owner) — desktop-first. Placeholder.
// Role-gating (festival_members) and the admin navigation arrive in step 5.
export default function AdminLayout({
  children,
}: LayoutProps<"/f/[festivalSlug]/admin">) {
  return <div className="flex min-h-full flex-1 flex-col">{children}</div>;
}
