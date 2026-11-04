import { themeToCssVars } from "@/lib/theme/theme";

// Foundations check — not a product screen. Proves that fonts, the semantic
// colour tokens (as Tailwind utilities), and runtime white-label re-theming all
// work end to end. Will be replaced by the Mereth marketing/entry home later.

// A sample festival theme override, applied via inline CSS variables to show
// that the SAME utilities re-theme with no component changes.
const SAMPLE_FESTIVAL_THEME = themeToCssVars({
  "brand-primary": "#3b2a6b",
  "brand-primary-hover": "#2c1f52",
  "brand-accent": "#9c2a5b",
  "brand-accent-hover": "#7f2049",
  "bg-page": "#faf7f2",
  "text-heading": "#2c1f52",
});

function Swatch({ className, label }: { className: string; label: string }) {
  return (
    <div className="flex flex-col gap-2xs">
      <div className={`h-16 rounded-md border border-border-default ${className}`} />
      <span className="text-sm text-text-secondary">{label}</span>
    </div>
  );
}

function Demo({ heading }: { heading: string }) {
  return (
    <section className="flex flex-col gap-md rounded-lg border border-border-default bg-bg-surface p-lg">
      <h2 className="text-2xl font-semibold">{heading}</h2>
      <div className="flex flex-wrap gap-sm">
        <button className="rounded-md bg-brand-primary px-lg py-sm font-bold text-brand-on-primary transition-colors hover:bg-brand-primary-hover">
          Enter this class
        </button>
        <button className="rounded-md bg-brand-accent px-lg py-sm font-bold text-brand-on-primary transition-colors hover:bg-brand-accent-hover">
          Pay £14.00
        </button>
        <button className="rounded-md border border-brand-primary px-lg py-sm font-bold text-brand-primary transition-colors hover:bg-brand-primary-soft">
          View syllabus
        </button>
      </div>
      <div className="grid grid-cols-3 gap-sm sm:grid-cols-6">
        <Swatch className="bg-brand-primary" label="primary" />
        <Swatch className="bg-brand-primary-soft" label="primary soft" />
        <Swatch className="bg-brand-accent" label="accent" />
        <Swatch className="bg-feedback-success" label="success" />
        <Swatch className="bg-feedback-warning" label="warning" />
        <Swatch className="bg-feedback-error" label="error" />
      </div>
    </section>
  );
}

export default function FoundationsCheck() {
  return (
    <main className="mx-auto flex w-full max-w-4xl flex-col gap-xl px-md py-2xl">
      <header className="flex flex-col gap-2xs">
        <span className="text-sm font-bold uppercase tracking-widest text-text-secondary">
          Mereth · foundations
        </span>
        <h1 className="text-4xl font-semibold">Headings are Maven Pro</h1>
        <p className="max-w-prose text-lg text-text-secondary">
          Body and UI text are Lato. These colours, spacing and radii come from
          the design tokens — defined once and re-themed per festival at runtime.
        </p>
      </header>

      <Demo heading="Mereth default theme" />

      <div style={SAMPLE_FESTIVAL_THEME}>
        <Demo heading="Sample festival theme (same components)" />
      </div>
    </main>
  );
}
