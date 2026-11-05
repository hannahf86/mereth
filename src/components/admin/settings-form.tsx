"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { updateFestivalSettings } from "@/lib/admin/festival-actions";

const THEME_FIELDS: { token: string; label: string }[] = [
  { token: "brand-primary", label: "Primary" },
  { token: "brand-primary-hover", label: "Primary (hover)" },
  { token: "brand-primary-soft", label: "Primary (soft)" },
  { token: "brand-accent", label: "Accent (payment)" },
  { token: "brand-accent-hover", label: "Accent (hover)" },
  { token: "brand-accent-soft", label: "Accent (soft)" },
  { token: "bg-page", label: "Page background" },
  { token: "text-heading", label: "Headings" },
];

const fieldClass =
  "min-h-[44px] w-full rounded-md border border-border-default bg-bg-surface px-md py-sm text-base text-text-primary";
const labelClass = "text-sm font-bold tracking-[0.1px] text-text-primary";

export function SettingsForm({
  festivalSlug,
  name: initialName,
  contactEmail: initialEmail,
  photoPolicy: initialPhotoPolicy,
  theme,
}: {
  festivalSlug: string;
  name: string;
  contactEmail: string;
  photoPolicy: string;
  theme: Record<string, string>;
}) {
  const router = useRouter();
  const [name, setName] = useState(initialName);
  const [email, setEmail] = useState(initialEmail);
  const [photoPolicy, setPhotoPolicy] = useState(initialPhotoPolicy);
  const [colors, setColors] = useState<Record<string, string>>(() =>
    Object.fromEntries(THEME_FIELDS.map((f) => [f.token, theme[f.token]])),
  );
  const [status, setStatus] = useState<"idle" | "busy" | "saved" | "error">(
    "idle",
  );
  const [error, setError] = useState("");

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("busy");
    const res = await updateFestivalSettings(festivalSlug, {
      name,
      contactEmail: email,
      photoPolicy,
      theme: colors,
    });
    if (res.ok) {
      setStatus("saved");
      router.refresh();
    } else {
      setError(res.error);
      setStatus("error");
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-lg">
      <div className="flex flex-col gap-xs">
        <label htmlFor="name" className={labelClass}>
          Festival name
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
        <label htmlFor="contact" className={labelClass}>
          Contact email
        </label>
        <input
          id="contact"
          type="email"
          className={fieldClass}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>

      <div className="flex flex-col gap-xs">
        <label htmlFor="photoPolicy" className={labelClass}>
          Photography policy (shown at entry)
        </label>
        <textarea
          id="photoPolicy"
          rows={2}
          className={`${fieldClass} min-h-[72px]`}
          value={photoPolicy}
          onChange={(e) => setPhotoPolicy(e.target.value)}
          placeholder="e.g. Images may be used to promote the festival."
        />
      </div>

      <fieldset className="flex flex-col gap-md">
        <legend className="mb-xs text-base font-bold text-text-heading">
          Theme colours
        </legend>
        <div className="grid grid-cols-1 gap-sm sm:grid-cols-2">
          {THEME_FIELDS.map((f) => (
            <label
              key={f.token}
              className="flex items-center justify-between gap-md rounded-md border border-border-default p-sm"
            >
              <span className="text-sm font-bold text-text-primary">
                {f.label}
              </span>
              <input
                type="color"
                aria-label={f.label}
                value={colors[f.token] ?? "#000000"}
                onChange={(e) =>
                  setColors((c) => ({ ...c, [f.token]: e.target.value }))
                }
                className="h-9 w-16 cursor-pointer rounded border border-border-default"
              />
            </label>
          ))}
        </div>
        <p className="text-sm text-text-secondary">
          White text on the primary and accent colours must meet 4.5:1 contrast,
          or the theme is rejected.
        </p>
      </fieldset>

      {status === "error" ? (
        <Alert tone="error" title="We couldn&apos;t save that">
          {error}
        </Alert>
      ) : null}
      {status === "saved" ? (
        <Alert tone="success" title="Saved">
          Your settings are live across the festival.
        </Alert>
      ) : null}

      <div>
        <Button type="submit" disabled={status === "busy"}>
          {status === "busy" ? "Saving…" : "Save settings"}
        </Button>
      </div>
    </form>
  );
}
