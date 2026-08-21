import { useState } from "react";
import {
  ArrowRight,
  Check,
  ChevronRight,
  CircleCheck,
  FileSearch,
  Menu,
  Play,
  ScanEye,
  ShieldCheck,
  Sparkles,
  X,
} from "lucide-react";
import Link from "@/router";
import { ThemeToggle } from "@/components/theme";
import { localUser } from "@/lib/constants";

const capabilities = [
  {
    icon: FileSearch,
    title: "Analyze every signal",
    body: "Inspect text, images, audio, video and URLs in one focused workspace.",
  },
  {
    icon: Sparkles,
    title: "Explain the why",
    body: "Turn opaque AI signals into clear risk factors, evidence and confidence levels.",
  },
  {
    icon: ShieldCheck,
    title: "Verify with confidence",
    body: "Cross-reference claims against trusted sources before you share.",
  },
];

const proof = [
  "Multimodal content analysis",
  "Evidence-backed claim checks",
  "Clear, actionable risk scoring",
];

export default function Landing() {
  const [open, setOpen] = useState(false);
  const IsLogin=localStorage.getItem(localUser)?true:false;

  return (
    <main className="min-h-screen overflow-hidden bg-background text-foreground">
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="landing-orb landing-orb-one" />
        <div className="landing-orb landing-orb-two" />
        <div className="landing-grid" />
      </div>

      <header className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 sm:px-8">
        <Link
          href="/"
          className="flex items-center gap-2.5"
          aria-label="TruthLens AI home"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent text-primary-foreground shadow-lg shadow-primary/25">
            <ScanEye className="h-5 w-5" />
          </span>
          <span>
            <span className="block text-sm font-bold tracking-tight">
              TruthLens AI
            </span>
            <span className="block text-[10px] font-medium tracking-wide text-muted">
              MISINFORMATION INTELLIGENCE
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-7 text-sm text-muted md:flex">
          <a
            href="#how-it-works"
            className="transition-colors hover:text-foreground"
          >
            How it works
          </a>
          <a
            href="#capabilities"
            className="transition-colors hover:text-foreground"
          >
            Capabilities
          </a>
          <a href="#trust" className="transition-colors hover:text-foreground">
            Why TruthLens
          </a>
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <ThemeToggle />
          {IsLogin?<Link
            href="/dashboard"
            className="rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:-translate-y-0.5 hover:bg-primary/90"
          >
            Dashboard
          </Link>
          :<div className="flex gap-5 items-center">

          <Link
            href="/login"
            className="text-sm font-medium text-muted transition-colors hover:text-foreground"
          >
            Sign in
          </Link>
          <Link
            href="/analyze"
            className="rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:-translate-y-0.5 hover:bg-primary/90"
          >
            Try it free
          </Link>
            </div>}
        </div>
        <button
          onClick={() => setOpen(!open)}
          className="rounded-lg p-2 text-muted hover:bg-surface-2 md:hidden"
          aria-label="Toggle menu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </header>

      {open && (
        <div className="absolute inset-x-5 top-16 z-20 rounded-2xl border border-border bg-surface p-3 shadow-2xl md:hidden">
          {[
            ["How it works", "#how-it-works"],
            ["Capabilities", "#capabilities"],
            ["Why TruthLens", "#trust"],
          ].map(([label, href]) => (
            <a
              key={label}
              href={href}
              onClick={() => setOpen(false)}
              className="block rounded-lg px-3 py-3 text-sm text-muted hover:bg-surface-2 hover:text-foreground"
            >
              {label}
            </a>
          ))}
          <Link
            href="/analyze"
            onClick={() => setOpen(false)}
            className="mt-2 block rounded-lg bg-primary px-3 py-3 text-center text-sm font-semibold text-primary-foreground"
          >
            Try it free
          </Link>
        </div>
      )}

      <section className="mx-auto grid max-w-7xl items-center gap-14 px-5 pb-24 pt-16 sm:px-8 lg:grid-cols-[1.05fr_.95fr] lg:pb-32 lg:pt-24">
        <div className="landing-enter">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary">
            <Sparkles className="h-3.5 w-3.5" /> AI-powered misinformation
            intelligence
          </div>
          <h1 className="mt-6 max-w-3xl text-4xl font-bold leading-[1.08] tracking-tight sm:text-5xl lg:text-6xl">
            See what’s true{" "}
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              before it spreads.
            </span>
          </h1>
          <p className="mt-6 max-w-xl text-base leading-7 text-muted sm:text-lg">
            TruthLens AI helps teams detect misinformation, verify claims, and
            make better decisions with evidence they can understand.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              href="/analyze"
              className="group inline-flex h-12 items-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-xl shadow-primary/25 transition-all hover:-translate-y-0.5 hover:bg-primary/90"
            >
              Analyze content{" "}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <a
              href="#how-it-works"
              className="inline-flex h-12 items-center gap-2 rounded-xl border border-border-strong bg-surface/70 px-5 text-sm font-semibold text-foreground transition-colors hover:bg-surface-2"
            >
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-accent/15 text-accent">
                <Play className="ml-0.5 h-3 w-3 fill-current" />
              </span>{" "}
              See how it works
            </a>
          </div>
          <div className="mt-9 flex flex-wrap gap-x-5 gap-y-2 text-xs font-medium text-muted">
            {proof.map((item) => (
              <span key={item} className="flex items-center gap-1.5">
                <Check className="h-3.5 w-3.5 text-risk-low" />
                {item}
              </span>
            ))}
          </div>
        </div>

        <div className="landing-enter landing-delay relative mx-auto w-full max-w-xl">
          <div className="absolute -inset-8 -z-10 rounded-full bg-primary/20 blur-3xl" />
          <div className="rounded-2xl border border-border-strong bg-surface/90 p-3 shadow-2xl shadow-primary/10 backdrop-blur sm:p-5">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-risk-critical" />
                <span className="h-2.5 w-2.5 rounded-full bg-risk-moderate" />
                <span className="h-2.5 w-2.5 rounded-full bg-risk-low" />
              </div>
              <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-bold tracking-wider text-primary">
                LIVE ANALYSIS
              </span>
            </div>
            <div className="mt-5 grid gap-4 sm:grid-cols-[1.1fr_.9fr]">
              <div className="rounded-xl border border-border bg-surface-2/60 p-4">
                <p className="text-xs font-semibold text-muted">
                  CONTENT SIGNALS
                </p>
                <div className="mt-4 space-y-3">
                  {[
                    ["Claim consistency", "92%", "bg-risk-low"],
                    ["Source credibility", "67%", "bg-risk-moderate"],
                    ["Manipulation signals", "18%", "bg-risk-low"],
                  ].map(([label, value, color]) => (
                    <div key={label as string}>
                      <div className="mb-1.5 flex justify-between text-[11px] text-muted">
                        <span>{label}</span>
                        <span className="font-semibold text-foreground">
                          {value}
                        </span>
                      </div>
                      <div className="h-1.5 overflow-hidden rounded-full bg-border">
                        <div
                          className={`landing-progress h-full rounded-full ${color}`}
                          style={{ width: value }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-5 rounded-lg border border-primary/20 bg-primary/8 p-3">
                  <p className="text-[11px] font-semibold text-primary">
                    Context identified
                  </p>
                  <p className="mt-1 text-[11px] leading-4 text-muted">
                    Two claims require source verification before publishing.
                  </p>
                </div>
              </div>
              <div className="rounded-xl bg-gradient-to-b from-primary to-accent p-4 text-primary-foreground shadow-lg shadow-primary/20">
                <p className="text-[11px] font-bold tracking-wide text-primary-foreground/70">
                  TRUTHLENS SCORE
                </p>
                <div className="mx-auto mt-5 flex h-28 w-28 items-center justify-center rounded-full border-[10px] border-white/20 bg-white/10">
                  <div className="text-center">
                    <p className="text-3xl font-bold">82</p>
                    <p className="text-[10px] font-medium text-white/75">
                      CONFIDENT
                    </p>
                  </div>
                </div>
                <div className="mt-5 flex items-center gap-2 rounded-lg bg-black/10 p-2.5">
                  <CircleCheck className="h-4 w-4" />
                  <span className="text-[11px] font-medium">
                    Evidence available
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div className="landing-float absolute -bottom-6 -left-5 flex items-center gap-3 rounded-xl border border-border bg-surface px-4 py-3 shadow-xl">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-risk-low/10 text-risk-low">
              <ShieldCheck className="h-5 w-5" />
            </span>
            <span>
              <span className="block text-xs font-bold">Verified sources</span>
              <span className="text-[11px] text-muted">
                Cross-referenced in seconds
              </span>
            </span>
          </div>
        </div>
      </section>

      <section
        id="capabilities"
        className="border-y border-border bg-surface/60 py-20"
      >
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[.18em] text-primary">
              Built for clarity
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
              From noisy content to a clear next step.
            </h2>
          </div>
          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {capabilities.map(({ icon: Icon, title, body }, index) => (
              <article
                key={title}
                className="group rounded-2xl border border-border bg-background p-6 shadow-sm transition-all hover:-translate-y-1 hover:border-primary/35 hover:shadow-xl hover:shadow-primary/5"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-primary/15 to-accent/15 text-primary">
                  <Icon className="h-5 w-5" />
                </span>
                <span className="mt-6 block text-xs font-bold text-accent">
                  0{index + 1}
                </span>
                <h3 className="mt-2 text-lg font-bold">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted">{body}</p>
                <span className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-primary">
                  Explore <ChevronRight className="h-4 w-4" />
                </span>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section
        id="how-it-works"
        className="mx-auto max-w-7xl px-5 py-24 sm:px-8"
      >
        <div className="grid gap-10 lg:grid-cols-[.8fr_1.2fr]">
          <div>
            <p className="text-xs font-bold uppercase tracking-[.18em] text-primary">
              How it works
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
              The signal is there.
              <br />
              We make it visible.
            </h2>
            <p className="mt-5 max-w-md text-muted">
              A transparent workflow gives your team enough context to act
              without asking them to trust a black box.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              ["01", "Submit", "Drop in a claim, story, upload, or URL."],
              ["02", "Inspect", "AI maps claims, signals, and source context."],
              ["03", "Decide", "Review evidence and share with confidence."],
            ].map(([number, title, body]) => (
              <div
                key={number}
                className="rounded-2xl border border-border bg-surface p-5"
              >
                <span className="text-3xl font-bold text-primary/25">
                  {number}
                </span>
                <h3 className="mt-8 font-bold">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="trust" className="mx-auto max-w-7xl px-5 pb-24 sm:px-8">
        <div className="relative overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-br from-primary to-accent px-6 py-14 text-center text-primary-foreground shadow-2xl shadow-primary/20 sm:px-12">
          <div className="absolute inset-0 opacity-15 landing-grid" />
          <div className="relative mx-auto max-w-2xl">
            <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15">
              <ScanEye className="h-6 w-6" />
            </span>
            <h2 className="mt-6 text-3xl font-bold tracking-tight sm:text-4xl">
              Make every decision more defensible.
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-primary-foreground/75 sm:text-base">
              Bring clarity to fast-moving information with evidence that your
              team can see, understand, and trust.
            </p>
            <Link
              href={localStorage.getItem(localUser)?"/analyze":"/signup"}
              className="mt-8 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-primary shadow-lg transition-transform hover:-translate-y-0.5"
            >
              Start analyzing for free <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-border py-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-5 text-xs text-muted sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <span>
            © 2026 TruthLens AI. Intelligence for a clearer information
            landscape.
          </span>
          <span>Demo interface · Assessments are illustrative</span>
        </div>
      </footer>
    </main>
  );
}
