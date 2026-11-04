"use server";

import { z } from "zod";
import { createClient } from "@/lib/db/supabase/server";
import {
  getFestivalBySlug,
  getLatestEdition,
  getMyFestivalRoles,
} from "@/lib/db/queries";

const STAFF_ROLES = ["owner", "secretary"];

const classSchema = z.object({
  code: z.string().trim().min(1).max(20),
  title: z.string().trim().min(1).max(200),
  description: z.string().trim().max(2000).nullable(),
  disciplineId: z.string().uuid(),
  ageMin: z.number().int().min(0).max(120).nullable(),
  ageMax: z.number().int().min(0).max(120).nullable(),
  feePence: z.number().int().min(0),
  timeLimitSeconds: z.number().int().positive().nullable(),
  accompanist: z.enum(["not_required", "optional", "required"]),
  setPieceTitle: z.string().trim().max(300).nullable(),
  setPieceComposer: z.string().trim().max(200).nullable(),
  maxEntries: z.number().int().positive().nullable(),
  isGroup: z.boolean(),
  status: z.enum(["draft", "published", "closed", "cancelled"]),
});

export type ClassInput = z.infer<typeof classSchema>;
export type ClassActionResult =
  | { ok: true; redirect: string }
  | { ok: false; error: string };

async function staffContext(slug: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const festival = await getFestivalBySlug(slug);
  if (!festival) return null;
  const roles = await getMyFestivalRoles(festival.id);
  if (!roles.some((r) => STAFF_ROLES.includes(r))) return null;
  const edition = await getLatestEdition(festival.id);
  return { supabase, festival, edition };
}

function toRow(v: ClassInput) {
  return {
    discipline_id: v.disciplineId,
    code: v.code,
    title: v.title,
    description: v.description || null,
    age_min: v.ageMin,
    age_max: v.ageMax,
    fee_pence: v.feePence,
    time_limit_seconds: v.timeLimitSeconds,
    accompanist: v.accompanist,
    set_piece_title: v.setPieceTitle || null,
    set_piece_composer: v.setPieceComposer || null,
    max_entries: v.maxEntries,
    is_group: v.isGroup,
    status: v.status,
  };
}

function validate(input: ClassInput): { error: string } | { data: ClassInput } {
  const parsed = classSchema.safeParse(input);
  if (!parsed.success) return { error: "Please check the class details." };
  const v = parsed.data;
  if (v.ageMin != null && v.ageMax != null && v.ageMax < v.ageMin) {
    return { error: "Maximum age must be at least the minimum age." };
  }
  return { data: v };
}

export async function createClass(
  slug: string,
  input: ClassInput,
): Promise<ClassActionResult> {
  const ctx = await staffContext(slug);
  if (!ctx) return { ok: false, error: "You don't have access to do that." };
  if (!ctx.edition) return { ok: false, error: "This festival has no edition." };
  const checked = validate(input);
  if ("error" in checked) return { ok: false, error: checked.error };

  const { error } = await ctx.supabase.from("classes").insert({
    festival_id: ctx.festival.id,
    edition_id: ctx.edition.id,
    ...toRow(checked.data),
  });
  if (error) {
    if (error.code === "23505") {
      return { ok: false, error: `A class with code ${checked.data.code} already exists.` };
    }
    return { ok: false, error: "We couldn't create the class." };
  }
  return { ok: true, redirect: `/f/${ctx.festival.slug}/admin/syllabus` };
}

export async function updateClass(
  slug: string,
  classId: string,
  input: ClassInput,
): Promise<ClassActionResult> {
  const ctx = await staffContext(slug);
  if (!ctx) return { ok: false, error: "You don't have access to do that." };
  const checked = validate(input);
  if ("error" in checked) return { ok: false, error: checked.error };

  const { error } = await ctx.supabase
    .from("classes")
    .update(toRow(checked.data))
    .eq("id", classId)
    .eq("festival_id", ctx.festival.id);
  if (error) {
    if (error.code === "23505") {
      return { ok: false, error: `A class with code ${checked.data.code} already exists.` };
    }
    return { ok: false, error: "We couldn't save the class." };
  }
  return { ok: true, redirect: `/f/${ctx.festival.slug}/admin/syllabus` };
}
