"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { requestEmailOtp, verifyEmailOtp } from "@/lib/auth/actions";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";

// P.03 sign-in — passwordless. Sends a magic link + 6-digit code; the code can
// be entered here, or the link opened on this device. The chosen class is
// preserved via `next`.
export function SignInForm({ next }: { next: string }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState<"email" | "code">("email");
  const [status, setStatus] = useState<"idle" | "busy" | "error">("idle");
  const [error, setError] = useState("");

  async function sendLink(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("busy");
    const res = await requestEmailOtp(email, next);
    if (res.ok) {
      setStep("code");
      setStatus("idle");
    } else {
      setError(res.error);
      setStatus("error");
    }
  }

  async function verify(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("busy");
    const res = await verifyEmailOtp(email, code);
    if (res.ok) {
      router.push(next);
      router.refresh();
    } else {
      setError(res.error);
      setStatus("error");
    }
  }

  if (step === "code") {
    return (
      <form onSubmit={verify} className="flex flex-col gap-md">
        <Alert tone="success" title="Check your email">
          We&apos;ve sent a sign-in link and a 6-digit code to{" "}
          <strong>{email}</strong>. Enter the code below, or open the link on
          this device.
        </Alert>
        <div className="flex flex-col gap-xs">
          <label
            htmlFor="code"
            className="text-sm font-bold tracking-[0.1px] text-text-primary"
          >
            6-digit code
          </label>
          <input
            id="code"
            name="code"
            inputMode="numeric"
            autoComplete="one-time-code"
            pattern="\d{6}"
            maxLength={6}
            required
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
            className="min-h-[44px] w-full rounded-md border border-border-default bg-bg-surface px-md py-sm text-base tracking-[0.3em] text-text-primary"
          />
        </div>
        {status === "error" ? (
          <Alert tone="error" title="That didn&apos;t work">
            {error}
          </Alert>
        ) : null}
        <Button type="submit" disabled={status === "busy"} className="w-full">
          {status === "busy" ? "Checking…" : "Sign in"}
        </Button>
        <button
          type="button"
          onClick={() => {
            setStep("email");
            setStatus("idle");
            setCode("");
          }}
          className="text-sm text-brand-primary hover:underline"
        >
          Use a different email
        </button>
      </form>
    );
  }

  return (
    <form onSubmit={sendLink} className="flex flex-col gap-md">
      <div className="flex flex-col gap-xs">
        <label
          htmlFor="email"
          className="text-sm font-bold tracking-[0.1px] text-text-primary"
        >
          Email address
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="min-h-[44px] w-full rounded-md border border-border-default bg-bg-surface px-md py-sm text-base text-text-primary"
        />
      </div>
      {status === "error" ? (
        <Alert tone="error" title="We couldn&apos;t send that">
          {error}
        </Alert>
      ) : null}
      <Button type="submit" disabled={status === "busy"} className="w-full">
        {status === "busy" ? "Sending…" : "Email me a sign-in link"}
      </Button>
      <p className="text-sm text-text-secondary">
        No password needed — we&apos;ll email you a secure link and a code.
      </p>
    </form>
  );
}
