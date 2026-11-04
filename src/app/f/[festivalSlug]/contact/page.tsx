import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getFestivalBySlug } from "@/lib/db/queries";
import { Panel } from "@/components/ui/panel";
import { ContactForm } from "@/components/festival/contact-form";

export async function generateMetadata({
  params,
}: PageProps<"/f/[festivalSlug]/contact">): Promise<Metadata> {
  const { festivalSlug } = await params;
  const festival = await getFestivalBySlug(festivalSlug);
  return {
    title: festival ? `Contact · ${festival.name}` : "Contact",
    description: festival ? `Get in touch with ${festival.name}.` : undefined,
  };
}

export default async function ContactPage({
  params,
}: PageProps<"/f/[festivalSlug]/contact">) {
  const { festivalSlug } = await params;
  const festival = await getFestivalBySlug(festivalSlug);
  if (!festival) notFound();

  return (
    <main className="mx-auto flex w-full max-w-[42rem] flex-col gap-xl px-lg py-lg">
      <div className="flex flex-col gap-sm">
        <h1 className="text-3xl font-semibold">Contact {festival.name}</h1>
        <p className="text-lg text-text-secondary">
          Send the festival a message and they&apos;ll reply to your email.
        </p>
      </div>
      <Panel>
        <ContactForm festivalSlug={festival.slug} />
      </Panel>
    </main>
  );
}
