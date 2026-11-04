import { notFound } from "next/navigation";
import { getFestivalBySlug } from "@/lib/db/queries";
import { Panel } from "@/components/ui/panel";
import { SignInForm } from "@/components/festival/sign-in-form";

// P.03 Continue your entry — magic-link / OTP sign-in. The chosen class is
// preserved across sign-in via the `next` redirect.
export default async function SignInPage({
  params,
  searchParams,
}: PageProps<"/f/[festivalSlug]/sign-in">) {
  const { festivalSlug } = await params;
  const sp = await searchParams;
  const classCode = typeof sp.class === "string" ? sp.class : null;

  const festival = await getFestivalBySlug(festivalSlug);
  if (!festival) notFound();

  const next = classCode
    ? `/f/${festival.slug}/classes/${classCode}`
    : `/f/${festival.slug}`;

  return (
    <main className="mx-auto flex w-full max-w-[28rem] flex-col gap-xl px-lg py-2xl">
      <div className="flex flex-col gap-sm">
        <h1 className="text-3xl font-semibold">Continue your entry</h1>
        <p className="text-lg text-text-secondary">
          Sign in or create an account to add a competitor and pay.
          {classCode ? ` We'll keep class ${classCode} ready for you.` : ""}
        </p>
      </div>
      <Panel>
        <SignInForm next={next} />
      </Panel>
    </main>
  );
}
