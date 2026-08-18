import { ArrowLeft, Compass, ScanEye, Sparkles } from "lucide-react";
import Link from "@/router";

export default function NotFound() {
  return (
    <main className="relative grid min-h-screen place-items-center overflow-hidden bg-background px-5 py-10 text-foreground">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="not-found-orb not-found-orb-one" />
        <div className="not-found-orb not-found-orb-two" />
        <div className="landing-grid absolute inset-0" />
      </div>

      <section className="not-found-enter relative w-full max-w-xl text-center">
        <Link href="/" className="mx-auto inline-flex items-center gap-2.5 text-left" aria-label="Return to TruthLens AI home">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent text-primary-foreground shadow-lg shadow-primary/25">
            <ScanEye className="h-5 w-5" />
          </span>
          <span><span className="block text-sm font-bold">TruthLens AI</span><span className="block text-[10px] font-medium tracking-wide text-muted">MISINFORMATION INTELLIGENCE</span></span>
        </Link>

        <div className="relative mx-auto mt-12 flex h-44 w-44 items-center justify-center sm:h-52 sm:w-52">
          <div className="not-found-ring not-found-ring-one" />
          <div className="not-found-ring not-found-ring-two" />
          <div className="relative flex h-28 w-28 items-center justify-center rounded-3xl border border-primary/30 bg-surface shadow-2xl shadow-primary/10 sm:h-32 sm:w-32">
            <Compass className="not-found-compass h-12 w-12 text-primary sm:h-14 sm:w-14" />
          </div>
          <span className="not-found-spark absolute right-1 top-5 text-accent"><Sparkles className="h-6 w-6" /></span>
        </div>

        <p className="mt-9 text-sm font-bold uppercase tracking-[.24em] text-primary">Error 404</p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">This signal got lost.</h1>
        <p className="mx-auto mt-5 max-w-md text-sm leading-6 text-muted sm:text-base">The page you’re looking for doesn’t exist, may have moved, or the address was entered incorrectly.</p>

        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link href="/" className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-xl shadow-primary/25 transition-all hover:-translate-y-0.5 hover:bg-primary/90">
            <ArrowLeft className="h-4 w-4" /> Back to home
          </Link>
          <Link href="/dashboard" className="inline-flex h-12 items-center justify-center rounded-xl border border-border-strong bg-surface px-5 text-sm font-semibold text-foreground transition-colors hover:bg-surface-2">
            Open dashboard
          </Link>
        </div>
      </section>
    </main>
  );
}
