import Link from "next/link";
import { createClient } from "@/lib/db/supabase/server";
import { getFestivalBySlug, getMyFestivalRoles } from "@/lib/db/queries";

// DEV-ONLY testing toolbar. Pinned to the bottom of every page, it lets you
// sign in instantly as any role (no email / magic-link needed) and jump straight
// to the admin or entrant flow. Returns null in production BEFORE touching
// cookies, so it never makes production pages dynamic.
//
// It signs in as dedicated test accounts via the /dev/login route:
//   owner@mereth.dev     → owner on Alderford      → /admin
//   secretary@mereth.dev → secretary on Alderford  → /admin
//   parent@mereth.dev    → ordinary entrant        → /syllabus
const SLUG = "alderford";

const PERSONAS = [
  {
    label: "Owner",
    email: "owner@mereth.dev",
    name: "Olivia Owner",
    role: "owner",
    next: `/f/${SLUG}/admin`,
  },
  {
    label: "Secretary",
    email: "secretary@mereth.dev",
    name: "Sam Secretary",
    role: "secretary",
    next: `/f/${SLUG}/admin`,
  },
  {
    label: "Parent",
    email: "parent@mereth.dev",
    name: "Pat Parent",
    role: null,
    next: `/f/${SLUG}/syllabus`,
  },
] as const;

function loginHref(p: (typeof PERSONAS)[number]): string {
  const params = new URLSearchParams({ email: p.email, name: p.name, next: p.next });
  if (p.role) {
    params.set("festival", SLUG);
    params.set("role", p.role);
  }
  return `/dev/login?${params.toString()}`;
}

const pill =
  "rounded px-2 py-1 bg-[#2c2c2c] text-[#f2efe8] hover:bg-[#3d3d3d] transition-colors no-underline";
const linkPill =
  "rounded px-2 py-1 bg-transparent text-[#bcd3c6] hover:bg-[#2c2c2c] transition-colors no-underline";

export async function DevToolbar() {
  // Guard FIRST — never read cookies in production (keeps prod pages static).
  if (process.env.NODE_ENV !== "development") return null;

  let status = "Signed out";
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      const festival = await getFestivalBySlug(SLUG);
      const roles = festival ? await getMyFestivalRoles(festival.id) : [];
      const who = user.email ?? "signed in";
      status = roles.length ? `${who} · ${roles.join(", ")}` : `${who} · entrant`;
    }
  } catch {
    status = "auth unavailable";
  }

  return (
    <div className="fixed inset-x-0 bottom-0 z-[9999] flex flex-wrap items-center gap-2 border-t border-[#000] bg-[#171717] px-4 py-2 text-[13px] text-[#f2efe8] shadow-[0_-2px_8px_rgba(0,0,0,0.35)]">
      <span className="font-bold tracking-[1px] text-[#e3b23c]">DEV</span>
      <span className="text-[#cfcabd]">{status}</span>

      <span className="mx-1 text-[#555]">·</span>
      <span className="text-[#cfcabd]">Sign in as</span>
      {PERSONAS.map((p) => (
        <a key={p.label} href={loginHref(p)} className={pill}>
          {p.label}
        </a>
      ))}

      <span className="mx-1 text-[#555]">·</span>
      <Link href={`/f/${SLUG}/admin`} className={linkPill}>
        Admin
      </Link>
      <Link href={`/f/${SLUG}/syllabus`} className={linkPill}>
        Syllabus
      </Link>
      <Link href={`/f/${SLUG}/basket`} className={linkPill}>
        Basket
      </Link>
      <Link href="/" className={linkPill}>
        Home
      </Link>

      <a href="/dev/logout" className={`${pill} ml-auto`}>
        Sign out
      </a>
    </div>
  );
}
