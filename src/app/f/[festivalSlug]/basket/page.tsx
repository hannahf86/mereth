import { notFound, redirect } from "next/navigation";
import { getUser } from "@/lib/auth/user";
import { getFestivalBySlug, getBasketEntries } from "@/lib/db/queries";
import { Panel } from "@/components/ui/panel";
import {
  BasketReview,
  type BasketItem,
} from "@/components/festival/basket-review";

// P.05 Review basket.
export default async function BasketPage({
  params,
}: PageProps<"/f/[festivalSlug]/basket">) {
  const { festivalSlug } = await params;
  const festival = await getFestivalBySlug(festivalSlug);
  if (!festival) notFound();

  const user = await getUser();
  if (!user) redirect(`/f/${festival.slug}/sign-in`);

  const entries = await getBasketEntries(festival.id);
  const items: BasketItem[] = entries.map((e) => {
    const cls = Array.isArray(e.classes) ? e.classes[0] : e.classes;
    const comp = Array.isArray(e.competitors)
      ? e.competitors[0]
      : e.competitors;
    return {
      id: e.id,
      code: cls?.code ?? "",
      title: cls?.title ?? "",
      fee: cls?.fee_pence ?? 0,
      competitor: comp ? `${comp.first_name} ${comp.last_name}` : "",
      piece: e.piece_title,
      composer: e.piece_composer,
    };
  });
  const total = items.reduce((sum, i) => sum + i.fee, 0);

  return (
    <main className="mx-auto flex w-full max-w-[42rem] flex-col gap-xl px-lg py-lg">
      <h1 className="text-3xl font-semibold">Your basket</h1>
      <Panel>
        <BasketReview
          items={items}
          total={total}
          festivalSlug={festival.slug}
          browseHref={`/f/${festival.slug}`}
          contactEmail={user.email ?? ""}
        />
      </Panel>
    </main>
  );
}
