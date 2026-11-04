"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { sendContactMessage } from "@/lib/festival/contact-actions";

const fieldClass =
  "min-h-[44px] w-full rounded-md border border-border-default bg-bg-surface px-md py-sm text-base text-text-primary";
const labelClass = "text-sm font-bold tracking-[0.1px] text-text-primary";

export function ContactForm({ festivalSlug }: { festivalSlug: string }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [website, setWebsite] = useState(""); // honeypot
  const [status, setStatus] = useState<"idle" | "busy" | "sent" | "error">(
    "idle",
  );
  const [error, setError] = useState("");

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("busy");
    const res = await sendContactMessage(festivalSlug, {
      name,
      email,
      message,
      website,
    });
    if (res.ok) {
      setStatus("sent");
    } else {
      setError(res.error);
      setStatus("error");
    }
  }

  if (status === "sent") {
    return (
      <Alert tone="success" title="Message sent">
        Thanks — the festival will be in touch.
      </Alert>
    );
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-md">
      <div className="flex flex-col gap-xs">
        <label htmlFor="name" className={labelClass}>
          Your name
        </label>
        <input
          id="name"
          required
          className={fieldClass}
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>
      <div className="flex flex-col gap-xs">
        <label htmlFor="email" className={labelClass}>
          Your email
        </label>
        <input
          id="email"
          type="email"
          required
          autoComplete="email"
          className={fieldClass}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <div className="flex flex-col gap-xs">
        <label htmlFor="message" className={labelClass}>
          Message
        </label>
        <textarea
          id="message"
          required
          rows={4}
          className={`${fieldClass} min-h-[120px]`}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
      </div>
      {/* Honeypot — hidden from people, often filled by bots. */}
      <div className="hidden" aria-hidden="true">
        <label htmlFor="website">Leave this blank</label>
        <input
          id="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
        />
      </div>
      {status === "error" ? (
        <Alert tone="error" title="We couldn&apos;t send that">
          {error}
        </Alert>
      ) : null}
      <div>
        <Button type="submit" disabled={status === "busy"}>
          {status === "busy" ? "Sending…" : "Send message"}
        </Button>
      </div>
    </form>
  );
}
