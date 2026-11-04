"use server";

import { z } from "zod";
import { createClient } from "@/lib/db/supabase/server";
import {
  getFestivalBySlug,
  getLatestEdition,
  getMyFestivalRoles,
} from "@/lib/db/queries";
import { validateThemeContrast, type FestivalTheme } from "@/lib/theme/theme";
import { COLOR_TOKENS } from "@/lib/theme/tokens";

export type SettingsResult = { ok: true } | { ok: false; error: string };

const hex = z.string().regex(/^#[0-9a-fA-F]{6}$/);

export type FestivalSettingsInput = {
  name: string;
  contactEmail: string;
  theme: Record<string, string>;
};

// Festival setup + theme. Owner-only (RLS also restricts festivals updates to
// owners). The theme is validated for AA contrast server-side and rejected if it
// fails — a failing theme is never saved.
export async function updateFestivalSettings(
  slug: string,
  input: FestivalSettingsInput,
): Promise<SettingsResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Please sign in again." };

  const festival = await getFestivalBySlug(slug);
  if (!festival) return { ok: false, error: "Festival not found." };
  const roles = await getMyFestivalRoles(festival.id);
  if (!roles.includes("owner")) {
    return { ok: false, error: "Only the festival owner can change settings." };
  }

  const name = input.name.trim();
  if (!name) return { ok: false, error: "The festival name is required." };
  const contactEmail = input.contactEmail.trim();

  // Keep only valid hex overrides for known colour tokens.
  const theme: FestivalTheme = {};
  for (const token of COLOR_TOKENS) {
    const value = input.theme[token];
    if (value && hex.safeParse(value).success) {
      theme[token] = value.toLowerCase();
    }
  }

  const contrast = validateThemeContrast(theme);
  if (!contrast.ok) {
    const issue = contrast.issues[0];
    return {
      ok: false,
      error: `${issue.pair} contrast is only ${issue.ratio}:1 (needs at least 4.5:1). Choose a darker background or lighter text.`,
    };
  }

  const { error } = await supabase
    .from("festivals")
    .update({ name, contact_email: contactEmail || null, theme })
    .eq("id", festival.id);
  if (error) return { ok: false, error: "We couldn't save the settings." };

  return { ok: true };
}

const STAFF_ROLES = ["owner", "secretary"];
const editionStatus = z.enum([
  "draft",
  "entries_open",
  "entries_closed",
  "scheduling",
  "timetable_published",
  "running",
  "complete",
]);

// Entry-window control. Staff (owner/secretary) set the edition status and the
// open/close timestamps. The entrant flow already enforces entries_open before
// allowing new entries or checkout, so closing here actually closes entries.
export async function setEntryWindow(
  slug: string,
  input: {
    status: string;
    entriesOpenAt: string | null;
    entriesCloseAt: string | null;
  },
): Promise<SettingsResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Please sign in again." };

  const festival = await getFestivalBySlug(slug);
  if (!festival) return { ok: false, error: "Festival not found." };
  const roles = await getMyFestivalRoles(festival.id);
  if (!roles.some((r) => STAFF_ROLES.includes(r))) {
    return { ok: false, error: "You don't have access to do that." };
  }
  const edition = await getLatestEdition(festival.id);
  if (!edition) return { ok: false, error: "This festival has no edition." };

  const status = editionStatus.safeParse(input.status);
  if (!status.success) return { ok: false, error: "Invalid status." };

  const { error } = await supabase
    .from("festival_editions")
    .update({
      status: status.data,
      entries_open_at: input.entriesOpenAt || null,
      entries_close_at: input.entriesCloseAt || null,
    })
    .eq("id", edition.id)
    .eq("festival_id", festival.id);
  if (error) return { ok: false, error: "We couldn't update the entry window." };

  return { ok: true };
}
