import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Cache Components / Partial Prefetching are intentionally OFF for the MVP.
  // Mereth is almost entirely authenticated + per-tenant dynamic, so the
  // static-shell model would force Suspense/"use cache" discipline on every
  // route for little gain. Revisit for public-ish routes during hardening.
  // See docs/DECISIONS.md.
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
