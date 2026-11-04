import { createClient } from "@/lib/db/supabase/server";

// Public, read-only syllabus queries. These rely on the public RLS policies
// (festivals/editions readable by all; classes readable when published), so the
// ordinary server client (anon context) is enough — no service role needed.

export async function getFestivals() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("festivals")
    .select("id, name, slug")
    .order("name");
  return data ?? [];
}

export async function getFestivalBySlug(slug: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("festivals")
    .select("id, name, slug, contact_email, logo_path, theme")
    .eq("slug", slug)
    .maybeSingle();
  return data;
}

export async function getLatestEdition(festivalId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("festival_editions")
    .select(
      "id, year, title, starts_on, ends_on, age_cutoff_date, entries_open_at, entries_close_at, status",
    )
    .eq("festival_id", festivalId)
    .order("year", { ascending: false })
    .limit(1)
    .maybeSingle();
  return data;
}

export async function getPublishedClasses(editionId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("classes")
    .select(
      "id, code, title, description, age_min, age_max, set_piece_title, set_piece_composer, fee_pence, time_limit_seconds, accompanist, disciplines(name)",
    )
    .eq("edition_id", editionId)
    .eq("status", "published")
    .order("code");
  return data ?? [];
}

// The signed-in user's basket entries for a festival (RLS restricts to own).
export async function getBasketEntries(festivalId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("entries")
    .select(
      "id, piece_title, piece_composer, accompanist_choice, classes(code, title, fee_pence), competitors(first_name, last_name)",
    )
    .eq("festival_id", festivalId)
    .eq("status", "basket")
    .order("created_at");
  return data ?? [];
}

export async function getBasketCount(festivalId: string): Promise<number> {
  const supabase = await createClient();
  const { count } = await supabase
    .from("entries")
    .select("id", { count: "exact", head: true })
    .eq("festival_id", festivalId)
    .eq("status", "basket");
  return count ?? 0;
}

// Global disciplines reference (public).
export async function getDisciplines() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("disciplines")
    .select("id, name")
    .order("sort_order");
  return data ?? [];
}

// The current user's roles in a festival (empty if not a member).
export async function getMyFestivalRoles(festivalId: string): Promise<string[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];
  const { data } = await supabase
    .from("festival_members")
    .select("role")
    .eq("festival_id", festivalId)
    .eq("profile_id", user.id);
  return (data ?? []).map((r) => r.role);
}

// A single order by its human reference (RLS restricts to the payer / staff).
export async function getOrderByReference(festivalId: string, reference: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("orders")
    .select(
      "reference, status, total_pence, order_items(amount_pence, entries(piece_title, classes(code, title), competitors(first_name, last_name)))",
    )
    .eq("festival_id", festivalId)
    .eq("reference", reference)
    .maybeSingle();
  return data;
}

// The signed-in user's own competitors (RLS restricts to owner).
export async function getMyCompetitors() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("competitors")
    .select("id, first_name, last_name, date_of_birth")
    .order("first_name");
  return data ?? [];
}

export async function getPublishedClassByCode(editionId: string, code: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("classes")
    .select(
      "id, code, title, description, age_min, age_max, set_piece_title, set_piece_composer, fee_pence, time_limit_seconds, accompanist, disciplines(name)",
    )
    .eq("edition_id", editionId)
    .eq("code", code)
    .eq("status", "published")
    .maybeSingle();
  return data;
}
