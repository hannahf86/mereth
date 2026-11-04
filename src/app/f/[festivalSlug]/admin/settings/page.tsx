import { requireFestivalStaff } from "@/lib/auth/staff";
import { resolveTheme, type FestivalTheme } from "@/lib/theme/theme";
import { Alert } from "@/components/ui/alert";
import { SettingsForm } from "@/components/admin/settings-form";

// A.01 — festival setup + theme (owner only).
export default async function AdminSettings({
  params,
}: PageProps<"/f/[festivalSlug]/admin/settings">) {
  const { festivalSlug } = await params;
  const { festival, roles } = await requireFestivalStaff(festivalSlug);
  const isOwner = roles.includes("owner");
  const theme = resolveTheme(
    (festival.theme ?? {}) as unknown as FestivalTheme,
  );

  return (
    <div className="flex flex-col gap-lg">
      <h2 className="text-2xl font-semibold">Festival settings</h2>
      {isOwner ? (
        <SettingsForm
          festivalSlug={festival.slug}
          name={festival.name}
          contactEmail={festival.contact_email ?? ""}
          theme={theme}
        />
      ) : (
        <Alert tone="info" title="Owner only">
          Only the festival owner can change these settings.
        </Alert>
      )}
    </div>
  );
}
