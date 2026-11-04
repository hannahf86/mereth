"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Alert } from "@/components/ui/alert";
import {
  createClass,
  updateClass,
  type ClassInput,
} from "@/lib/admin/class-actions";

const fieldClass =
  "min-h-[44px] w-full rounded-md border border-border-default bg-bg-surface px-md py-sm text-base text-text-primary";
const labelClass = "text-sm font-bold tracking-[0.1px] text-text-primary";

export type ClassFormValues = {
  code: string;
  title: string;
  description: string;
  disciplineId: string;
  ageMin: string;
  ageMax: string;
  feePounds: string;
  timeLimitMinutes: string;
  accompanist: "not_required" | "optional" | "required";
  setPieceTitle: string;
  setPieceComposer: string;
  maxEntries: string;
  isGroup: boolean;
  status: "draft" | "published" | "closed" | "cancelled";
};

const EMPTY: ClassFormValues = {
  code: "",
  title: "",
  description: "",
  disciplineId: "",
  ageMin: "",
  ageMax: "",
  feePounds: "",
  timeLimitMinutes: "",
  accompanist: "not_required",
  setPieceTitle: "",
  setPieceComposer: "",
  maxEntries: "",
  isGroup: false,
  status: "draft",
};

export function ClassForm({
  festivalSlug,
  disciplines,
  classId,
  initial,
}: {
  festivalSlug: string;
  disciplines: { id: string; name: string }[];
  classId?: string;
  initial?: Partial<ClassFormValues>;
}) {
  const router = useRouter();
  const [v, setV] = useState<ClassFormValues>({
    ...EMPTY,
    disciplineId: disciplines[0]?.id ?? "",
    ...initial,
  });
  const [status, setStatus] = useState<"idle" | "busy" | "error">("idle");
  const [error, setError] = useState("");

  function set<K extends keyof ClassFormValues>(key: K, value: ClassFormValues[K]) {
    setV((prev) => ({ ...prev, [key]: value }));
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("busy");
    const input: ClassInput = {
      code: v.code.trim(),
      title: v.title.trim(),
      description: v.description.trim() || null,
      disciplineId: v.disciplineId,
      ageMin: v.ageMin === "" ? null : Number(v.ageMin),
      ageMax: v.ageMax === "" ? null : Number(v.ageMax),
      feePence: Math.round((Number(v.feePounds) || 0) * 100),
      timeLimitSeconds:
        v.timeLimitMinutes === "" ? null : Math.round(Number(v.timeLimitMinutes) * 60),
      accompanist: v.accompanist,
      setPieceTitle: v.setPieceTitle.trim() || null,
      setPieceComposer: v.setPieceComposer.trim() || null,
      maxEntries: v.maxEntries === "" ? null : Number(v.maxEntries),
      isGroup: v.isGroup,
      status: v.status,
    };
    const res = classId
      ? await updateClass(festivalSlug, classId, input)
      : await createClass(festivalSlug, input);
    if (res.ok) {
      router.push(res.redirect);
      router.refresh();
    } else {
      setError(res.error);
      setStatus("error");
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-lg">
      <div className="grid grid-cols-1 gap-md sm:grid-cols-[1fr_2fr]">
        <div className="flex flex-col gap-xs">
          <label htmlFor="code" className={labelClass}>
            Code
          </label>
          <input
            id="code"
            required
            className={fieldClass}
            value={v.code}
            onChange={(e) => set("code", e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-xs">
          <label htmlFor="title" className={labelClass}>
            Title
          </label>
          <input
            id="title"
            required
            className={fieldClass}
            value={v.title}
            onChange={(e) => set("title", e.target.value)}
          />
        </div>
      </div>

      <Select
        id="discipline"
        label="Instrument / discipline"
        value={v.disciplineId}
        onChange={(e) => set("disciplineId", e.target.value)}
      >
        {disciplines.map((d) => (
          <option key={d.id} value={d.id}>
            {d.name}
          </option>
        ))}
      </Select>

      <div className="flex flex-col gap-xs">
        <label htmlFor="description" className={labelClass}>
          Description (optional)
        </label>
        <textarea
          id="description"
          rows={2}
          className={`${fieldClass} min-h-[72px]`}
          value={v.description}
          onChange={(e) => set("description", e.target.value)}
        />
      </div>

      <div className="grid grid-cols-2 gap-md sm:grid-cols-4">
        <div className="flex flex-col gap-xs">
          <label htmlFor="ageMin" className={labelClass}>
            Min age
          </label>
          <input
            id="ageMin"
            type="number"
            min={0}
            className={fieldClass}
            value={v.ageMin}
            onChange={(e) => set("ageMin", e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-xs">
          <label htmlFor="ageMax" className={labelClass}>
            Max age
          </label>
          <input
            id="ageMax"
            type="number"
            min={0}
            className={fieldClass}
            value={v.ageMax}
            onChange={(e) => set("ageMax", e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-xs">
          <label htmlFor="fee" className={labelClass}>
            Fee (£)
          </label>
          <input
            id="fee"
            type="number"
            min={0}
            step="0.01"
            required
            className={fieldClass}
            value={v.feePounds}
            onChange={(e) => set("feePounds", e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-xs">
          <label htmlFor="time" className={labelClass}>
            Time (min)
          </label>
          <input
            id="time"
            type="number"
            min={0}
            step="0.5"
            className={fieldClass}
            value={v.timeLimitMinutes}
            onChange={(e) => set("timeLimitMinutes", e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-md sm:grid-cols-2">
        <div className="flex flex-col gap-xs">
          <label htmlFor="setPieceTitle" className={labelClass}>
            Set piece title (blank = own choice)
          </label>
          <input
            id="setPieceTitle"
            className={fieldClass}
            value={v.setPieceTitle}
            onChange={(e) => set("setPieceTitle", e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-xs">
          <label htmlFor="setPieceComposer" className={labelClass}>
            Set piece composer
          </label>
          <input
            id="setPieceComposer"
            className={fieldClass}
            value={v.setPieceComposer}
            onChange={(e) => set("setPieceComposer", e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-md sm:grid-cols-3">
        <Select
          id="accompanist"
          label="Accompanist"
          value={v.accompanist}
          onChange={(e) =>
            set("accompanist", e.target.value as ClassFormValues["accompanist"])
          }
        >
          <option value="not_required">Not required</option>
          <option value="optional">Optional</option>
          <option value="required">Required</option>
        </Select>
        <div className="flex flex-col gap-xs">
          <label htmlFor="maxEntries" className={labelClass}>
            Max entries (optional)
          </label>
          <input
            id="maxEntries"
            type="number"
            min={1}
            className={fieldClass}
            value={v.maxEntries}
            onChange={(e) => set("maxEntries", e.target.value)}
          />
        </div>
        <Select
          id="status"
          label="Status"
          value={v.status}
          onChange={(e) =>
            set("status", e.target.value as ClassFormValues["status"])
          }
        >
          <option value="draft">Draft</option>
          <option value="published">Published</option>
          <option value="closed">Closed</option>
          <option value="cancelled">Cancelled</option>
        </Select>
      </div>

      <label className="flex items-center gap-sm">
        <input
          type="checkbox"
          checked={v.isGroup}
          onChange={(e) => set("isGroup", e.target.checked)}
        />
        <span className="text-sm text-text-primary">
          Group class (duet, ensemble, choir)
        </span>
      </label>

      {status === "error" ? (
        <Alert tone="error" title="We couldn&apos;t save this">
          {error}
        </Alert>
      ) : null}

      <div className="flex gap-sm">
        <Button type="submit" disabled={status === "busy"}>
          {status === "busy" ? "Saving…" : classId ? "Save class" : "Create class"}
        </Button>
      </div>
    </form>
  );
}
