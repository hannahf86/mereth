"use server";

import { z } from "zod";
import { createClient } from "@/lib/db/supabase/server";
import {
  getFestivalBySlug,
  getLatestEdition,
  getPublishedClassByCode,
} from "@/lib/db/queries";
import { checkEligibility } from "@/lib/domain/eligibility/eligibility";

export type EntryResult =
  | { ok: true; redirect: string }
  | { ok: false; error: string };

const newCompetitorSchema = z.object({
  firstName: z.string().trim().min(1).max(100),
  lastName: z.string().trim().min(1).max(100),
  dob: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

export type CreateBasketEntryInput = {
  festivalSlug: string;
  classCode: string;
  competitorId?: string;
  newCompetitor?: {
    firstName: string;
    lastName: string;
    dob: string;
  };
  pieceTitle?: string;
  pieceComposer?: string;
  accompanistChoice?: string;
  // Consent for this edition (brief update 02 §2).
  mediaConsent: "granted" | "refused";
  resultsNameConsent: boolean;
};

// P.04 add-to-basket. All rules are enforced here server-side: entries window,
// eligibility (age on the edition cut-off), and one active entry per class.
export async function createBasketEntry(
  input: CreateBasketEntryInput,
): Promise<EntryResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Please sign in again." };

  const festival = await getFestivalBySlug(input.festivalSlug);
  if (!festival) return { ok: false, error: "Festival not found." };
  const edition = await getLatestEdition(festival.id);
  if (!edition) return { ok: false, error: "This festival isn't open yet." };
  if (edition.status !== "entries_open") {
    return { ok: false, error: "Entries for this festival are closed." };
  }
  const cls = await getPublishedClassByCode(edition.id, input.classCode);
  if (!cls) return { ok: false, error: "Class not found." };

  if (input.mediaConsent !== "granted" && input.mediaConsent !== "refused") {
    return { ok: false, error: "Please answer the photo and video question." };
  }

  // Resolve the competitor (existing, or create a new one owned by the user).
  let competitorId = input.competitorId;
  let dob: string;
  if (competitorId) {
    const { data: comp } = await supabase
      .from("competitors")
      .select("date_of_birth")
      .eq("id", competitorId)
      .maybeSingle();
    if (!comp) return { ok: false, error: "We couldn't find that competitor." };
    dob = comp.date_of_birth;
    await supabase
      .from("competitors")
      .update({ results_name_consent: input.resultsNameConsent })
      .eq("id", competitorId);
  } else {
    const parsed = newCompetitorSchema.safeParse(input.newCompetitor);
    if (!parsed.success) {
      return { ok: false, error: "Please complete the competitor's details." };
    }
    dob = parsed.data.dob;
    const { data: inserted, error } = await supabase
      .from("competitors")
      .insert({
        owner_profile_id: user.id,
        first_name: parsed.data.firstName,
        last_name: parsed.data.lastName,
        date_of_birth: parsed.data.dob,
        results_name_consent: input.resultsNameConsent,
      })
      .select("id")
      .single();
    if (error || !inserted) {
      return { ok: false, error: "We couldn't save the competitor." };
    }
    competitorId = inserted.id;
  }

  // Server-side eligibility re-check (never trust the client).
  const eligibility = checkEligibility({
    dob,
    cutoff: edition.age_cutoff_date,
    ageMin: cls.age_min,
    ageMax: cls.age_max,
  });
  if (!eligibility.eligible) {
    return { ok: false, error: eligibility.reason };
  }

  // Record consent for this edition (kept as history; latest is current).
  const { error: consentError } = await supabase
    .from("competitor_edition_consents")
    .insert({
      festival_id: festival.id,
      edition_id: edition.id,
      competitor_id: competitorId,
      media_consent: input.mediaConsent,
      results_name_consent: input.resultsNameConsent,
      given_by: user.id,
    });
  if (consentError) {
    return { ok: false, error: "We couldn't record consent. Please try again." };
  }

  // Repertoire: set piece is fixed; own choice requires a title.
  const pieceTitle = cls.set_piece_title ?? input.pieceTitle?.trim() ?? "";
  if (!cls.set_piece_title && !pieceTitle) {
    return { ok: false, error: "Please enter the piece title." };
  }
  const pieceComposer =
    cls.set_piece_composer ?? input.pieceComposer?.trim() ?? null;

  const { error: entryError } = await supabase.from("entries").insert({
    festival_id: festival.id,
    class_id: cls.id,
    competitor_id: competitorId,
    created_by: user.id,
    piece_title: pieceTitle || null,
    piece_composer: pieceComposer || null,
    accompanist_choice: input.accompanistChoice?.trim() || null,
    status: "basket",
    payer: "account_holder",
  });
  if (entryError) {
    if (entryError.code === "23505") {
      return {
        ok: false,
        error: "This competitor is already entered in this class.",
      };
    }
    return { ok: false, error: "We couldn't add this to your basket." };
  }

  return { ok: true, redirect: `/f/${festival.slug}/basket` };
}

// Remove a basket entry (P.05). Only the creator can, and only while in basket.
export async function removeBasketEntry(entryId: string): Promise<void> {
  const supabase = await createClient();
  await supabase
    .from("entries")
    .delete()
    .eq("id", entryId)
    .eq("status", "basket");
}
