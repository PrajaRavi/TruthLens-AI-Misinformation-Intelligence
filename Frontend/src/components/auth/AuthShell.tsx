import Link from "@/router";
import { ScanEye, ShieldCheck, Sparkles, Layers } from "lucide-react";

export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Brand panel */}
      <div className="relative hidden flex-col justify-between overflow-hidden bg-gradient-to-br from-primary/12 via-background to-accent/12 p-10 lg:flex">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent text-white">
            <ScanEye className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-bold text-foreground">TruthLens AI</p>
            <p className="text-[11px] text-muted">
              AI-Powered Misinformation Intelligence
            </p>
          </div>
        </Link>

        <div className="max-w-md">
          <h2 className="text-2xl font-bold leading-tight tracking-tight text-foreground">
            Detect misinformation. Verify claims. Trust better sources.
          </h2>
          <ul className="mt-6 space-y-3">
            {[
              {
                icon: Layers,
                text: "Multimodal analysis for text, images, audio, video & URLs",
              },
              {
                icon: ShieldCheck,
                text: "Cross-reference claims against verified sources",
              },
              {
                icon: Sparkles,
                text: "Transparent, evidence-backed risk assessments",
              },
            ].map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-start gap-3 text-sm">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-surface text-primary shadow-sm">
                  <Icon className="h-4 w-4" />
                </span>
                <span className="pt-1.5 text-foreground/80">{text}</span>
              </li>
            ))}
          </ul>
        </div>

        <p className="text-xs text-muted-2">
          Demo interface — assessments are illustrative and not definitive.
        </p>
      </div>

      {/* Form panel */}
      <div className="flex items-center justify-center px-5 py-12 sm:px-8">
        <div className="w-full max-w-sm">
          <Link
            href="/"
            className="mb-8 flex items-center gap-2.5 lg:hidden"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent text-white">
              <ScanEye className="h-5 w-5" />
            </div>
            <p className="text-sm font-bold text-foreground">TruthLens AI</p>
          </Link>

          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            {title}
          </h1>
          <p className="mt-1.5 text-sm text-muted">{subtitle}</p>

          <div className="mt-8">{children}</div>

          {footer && (
            <p className="mt-6 text-center text-sm text-muted">{footer}</p>
          )}
        </div>
      </div>
    </div>
  );
}
