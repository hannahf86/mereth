"use server";

import { z } from "zod";
import { getFestivalBySlug } from "@/lib/db/queries";
import { getResend } from "@/lib/integrations/email/resend";
import { getEmailFrom } from "@/lib/env";

export type ContactResult = { ok: true } | { ok: false; error: string };

const schema = z.object({
  name: z.string().trim().min(1).max(100),
  email: z.string().trim().email(),
  message: z.string().trim().min(1).max(5000),
});

// Contact form → emails the festival via Resend, reply-to the sender. Never
// exposes the festival's address. `website` is a honeypot for bots.
export async function sendContactMessage(
  slug: string,
  input: { name: string; email: string; message: string; website: string },
): Promise<ContactResult> {
  if (input.website) return { ok: true }; // silently drop bots

  const parsed = schema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Please complete all fields with a valid email." };
  }

  const festival = await getFestivalBySlug(slug);
  if (!festival) return { ok: false, error: "Festival not found." };
  if (!festival.contact_email) {
    return {
      ok: false,
      error: "This festival hasn't set a contact address yet.",
    };
  }

  const resend = getResend();
  const from = getEmailFrom();
  if (!resend || !from) {
    return {
      ok: false,
      error:
        "Sorry, the contact form isn't available just now — please try again later.",
    };
  }

  const { error } = await resend.emails.send({
    from,
    to: festival.contact_email,
    replyTo: parsed.data.email,
    subject: `Website enquiry · ${festival.name}`,
    text: `From: ${parsed.data.name} <${parsed.data.email}>\n\n${parsed.data.message}`,
  });
  if (error) {
    return {
      ok: false,
      error: "Sorry, we couldn't send your message. Please try again later.",
    };
  }
  return { ok: true };
}
