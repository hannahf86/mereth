import type { Metadata } from "next";
import { Maven_Pro, Lato } from "next/font/google";
import "./globals.css";
import { DevToolbar } from "@/components/dev/dev-toolbar";

// Headings — Maven Pro (variable weight). Exposed as --font-maven-pro.
const mavenPro = Maven_Pro({
  variable: "--font-maven-pro",
  subsets: ["latin"],
  display: "swap",
});

// Body & UI — Lato. Exposed as --font-lato.
const lato = Lato({
  variable: "--font-lato",
  subsets: ["latin"],
  weight: ["300", "400", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Mereth",
  description: "Entries, timetables and results for music festivals.",
};

// Root layout — carries the font variables; festival theming is applied lower
// down, on the /f/[festivalSlug] layout, so the Mereth app chrome stays default.
export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en-GB"
      className={`${mavenPro.variable} ${lato.variable} h-full antialiased`}
    >
      <body
        className={`min-h-full flex flex-col${
          process.env.NODE_ENV === "development" ? " pb-20" : ""
        }`}
      >
        {children}
        <DevToolbar />
      </body>
    </html>
  );
}
