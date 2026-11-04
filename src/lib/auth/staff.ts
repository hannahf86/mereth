import { notFound, redirect } from "next/navigation";
import { getUser } from "@/lib/auth/user";
import {
  getFestivalBySlug,
  getLatestEdition,
  getMyFestivalRoles,
} from "@/lib/db/queries";

const STAFF_ROLES = ["owner", "secretary"];

// Gate for admin pages: requires the signed-in user to be owner/secretary of the
// festival. Redirects otherwise. Returns the festival, edition and roles.
export async function requireFestivalStaff(slug: string) {
  const festival = await getFestivalBySlug(slug);
  if (!festival) notFound();
  const user = await getUser();
  if (!user) redirect(`/f/${slug}/sign-in`);
  const roles = await getMyFestivalRoles(festival.id);
  if (!roles.some((r) => STAFF_ROLES.includes(r))) {
    redirect(`/f/${slug}`);
  }
  const edition = await getLatestEdition(festival.id);
  return { festival, user, roles, edition };
}
