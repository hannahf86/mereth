"use client";

import { useMemo, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Alert } from "@/components/ui/alert";
import { checkEligibility } from "@/lib/domain/eligibility/eligibility";
import { createBasketEntry } from "@/lib/entries/actions";

type Competitor = {
  id: string;
  firstName: string;
  lastName: string;
  dob: string;
};

const fieldClass =
  "min-h-[44px] w-full rounded-md border border-border-default bg-bg-surface px-md py-sm text-base text-text-primary";
const labelClass = "text-sm font-bold tracking-[0.1px] text-text-primary";

// P.04 Who is performing — pick or add a competitor, confirm repertoire and
// accompanist, then add to the basket. Eligibility is previewed here and
// re-checked server-side.
export function EntryForm({
  festivalSlug,
  classCode,
  isSetPiece,
  setPieceTitle,
  setPieceComposer,
  accompanist,
  cutoffIso,
  cutoffLabel,
  ageMin,
  ageMax,
  competitors,
}: {
  festivalSlug: string;
  classCode: string;
  isSetPiece: boolean;
  setPieceTitle: string | null;
  setPieceComposer: string | null;
  accompanist: "not_required" | "optional" | "required";
  cutoffIso: string;
  cutoffLabel: string;
  ageMin: number | null;
  ageMax: number | null;
  competitors: Competitor[];
}) {
  const router = useRouter();
  const [mode, setMode] = useState<"existing" | "new">(
    competitors.length > 0 ? "existing" : "new",
  );
  const [competitorId, setCompetitorId] = useState(competitors[0]?.id ?? "");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [dob, setDob] = useState("");
  const [consent, setConsent] = useState(false);
  const [ownTitle, setOwnTitle] = useState("");
  const [ownComposer, setOwnComposer] = useState("");
  const [accompanistChoice, setAccompanistChoice] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [status, setStatus] = useState<"idle" | "busy" | "error">("idle");
  const [error, setError] = useState("");

  const activeDob =
    mode === "existing"
      ? competitors.find((c) => c.id === competitorId)?.dob
      : dob;

  const eligibility = useMemo(
    () =>
      activeDob
        ? checkEligibility({ dob: activeDob, cutoff: cutoffIso, ageMin, ageMax })
        : null,
    [activeDob, cutoffIso, ageMin, ageMax],
  );

  const needsPiece = !isSetPiece;
  const canSubmit =
    confirmed &&
    eligibility?.eligible === true &&
    (mode === "existing"
      ? competitorId !== ""
      : firstName.trim() !== "" && lastName.trim() !== "" && dob !== "") &&
    (!needsPiece || ownTitle.trim() !== "") &&
    (accompanist === "not_required" || accompanistChoice !== "");

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("busy");
    const res = await createBasketEntry({
      festivalSlug,
      classCode,
      competitorId: mode === "existing" ? competitorId : undefined,
      newCompetitor:
        mode === "new"
          ? { firstName, lastName, dob, consent }
          : undefined,
      pieceTitle: needsPiece ? ownTitle : undefined,
      pieceComposer: needsPiece ? ownComposer : undefined,
      accompanistChoice: accompanistChoice || undefined,
    });
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
      {/* Competitor */}
      <fieldset className="flex flex-col gap-sm">
        <legend className="mb-xs text-base font-bold text-text-heading">
          Competitor
        </legend>
        {competitors.map((c) => (
          <label
            key={c.id}
            className="flex items-center gap-sm rounded-md border border-border-default p-sm"
          >
            <input
              type="radio"
              name="competitor"
              checked={mode === "existing" && competitorId === c.id}
              onChange={() => {
                setMode("existing");
                setCompetitorId(c.id);
              }}
            />
            <span className="text-base text-text-primary">
              {c.firstName} {c.lastName}
            </span>
          </label>
        ))}
        <label className="flex items-center gap-sm rounded-md border border-border-default p-sm">
          <input
            type="radio"
            name="competitor"
            checked={mode === "new"}
            onChange={() => setMode("new")}
          />
          <span className="text-base text-text-primary">Add someone new</span>
        </label>
      </fieldset>

      {mode === "new" ? (
        <div className="flex flex-col gap-md rounded-md bg-bg-subtle p-md">
          <div className="flex flex-col gap-xs">
            <label htmlFor="firstName" className={labelClass}>
              First name
            </label>
            <input
              id="firstName"
              className={fieldClass}
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-xs">
            <label htmlFor="lastName" className={labelClass}>
              Last name
            </label>
            <input
              id="lastName"
              className={fieldClass}
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-xs">
            <label htmlFor="dob" className={labelClass}>
              Date of birth
            </label>
            <input
              id="dob"
              type="date"
              className={fieldClass}
              value={dob}
              onChange={(e) => setDob(e.target.value)}
            />
            <p className="text-sm text-text-secondary">
              Used only to check eligibility (age on {cutoffLabel}). Never shown
              publicly.
            </p>
          </div>
          <label className="flex items-start gap-sm">
            <input
              type="checkbox"
              className="mt-1"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
            />
            <span className="text-sm text-text-secondary">
              Show this competitor&apos;s name in published results (optional).
            </span>
          </label>
        </div>
      ) : null}

      {/* Eligibility preview */}
      {eligibility?.eligible ? (
        <Alert tone="success" title="Eligible for this class">
          They&apos;ll be {eligibility.age} on {cutoffLabel}.
        </Alert>
      ) : eligibility ? (
        <Alert tone="error" title="Not eligible for this class">
          {eligibility.reason}
        </Alert>
      ) : null}

      {/* Repertoire */}
      {isSetPiece ? (
        <div className="flex flex-col gap-2xs rounded-md bg-bg-subtle p-md">
          <span className={labelClass}>Set piece</span>
          <span className="text-base text-text-primary">
            {setPieceComposer ? `${setPieceComposer} · ` : ""}
            {setPieceTitle}
          </span>
        </div>
      ) : (
        <div className="flex flex-col gap-md">
          <div className="flex flex-col gap-xs">
            <label htmlFor="pieceTitle" className={labelClass}>
              Piece title
            </label>
            <input
              id="pieceTitle"
              className={fieldClass}
              value={ownTitle}
              onChange={(e) => setOwnTitle(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-xs">
            <label htmlFor="pieceComposer" className={labelClass}>
              Composer (optional)
            </label>
            <input
              id="pieceComposer"
              className={fieldClass}
              value={ownComposer}
              onChange={(e) => setOwnComposer(e.target.value)}
            />
          </div>
        </div>
      )}

      {/* Accompanist */}
      {accompanist !== "not_required" ? (
        <Select
          id="accompanist"
          label={
            accompanist === "required"
              ? "Accompanist (required for this class)"
              : "Accompanist"
          }
          value={accompanistChoice}
          onChange={(e) => setAccompanistChoice(e.target.value)}
        >
          <option value="">Please choose…</option>
          <option value="Bringing own accompanist">
            I&apos;ll bring my own
          </option>
          <option value="Festival to arrange">Please arrange one for me</option>
          {accompanist === "optional" ? (
            <option value="No accompanist">No accompanist</option>
          ) : null}
        </Select>
      ) : null}

      {/* Confirm */}
      <label className="flex items-start gap-sm">
        <input
          type="checkbox"
          className="mt-1"
          checked={confirmed}
          onChange={(e) => setConfirmed(e.target.checked)}
        />
        <span className="text-sm text-text-primary">
          I confirm these details are correct.
        </span>
      </label>

      {status === "error" ? (
        <Alert tone="error" title="We couldn&apos;t add this">
          {error}
        </Alert>
      ) : null}

      <Button
        type="submit"
        disabled={!canSubmit || status === "busy"}
        className="w-full"
      >
        {status === "busy" ? "Adding…" : "Add to basket"}
      </Button>
    </form>
  );
}
