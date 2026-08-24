import { Check, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { cn } from "@/lib/utils";
import type { ProcessingStep } from "@/types";
// import WarningTyping from "@/utils/WarningTyping";

export function AnalysisProgress({ steps }: { steps: ProcessingStep[] }) {
  const doneCount = steps.filter((s) => s.status === "done").length;
  const activeCount = steps.filter((s) => s.status === "active").length;
  const pct = Math.round(
    ((doneCount + activeCount * 0.5) / steps.length) * 100
  );

  return (
    <Card className="mx-auto max-w-xl">
      <CardContent className="pt-6">
        <div className="mb-6 flex flex-col items-center text-center">
          {/* <WarningTyping
  warnings={[
  " This claim contains information that may be misleading.",
  " Some parts of the claim are not supported by the available evidence.",
  " Please check the information carefully before making a decision.",
  " AI can misbehave or halucinate so before making final decesion think twice.."
]}
  typingSpeed={60}
  sentenceInterval={2000}
/> */}
          <div className="relative mt-2 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 pulse-ring">
            <Loader2 className="h-7 w-7 animate-spin text-primary" />
          </div>
          <h2 className="mt-4 text-lg font-semibold text-foreground">
            Analyzing Content
          </h2>
          <p className="mt-1 text-sm text-muted">
            Running multimodal misinformation analysis — {pct}% complete
          </p>
          <div className="mt-4 h-1.5 w-full max-w-xs overflow-hidden rounded-full bg-surface-2">
            <div
              className="h-full rounded-full bg-gradient-to-r from-primary to-accent transition-all duration-500"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>

        <ol className="relative ml-3 space-y-1">
          {steps.map((step, i) => {
            const isLast = i === steps.length - 1;
            return (
              <li key={step.id} className="relative flex gap-4 pb-5 last:pb-0">
                {!isLast && (
                  <span
                    className={cn(
                      "absolute left-[11px] top-6 h-full w-0.5",
                      step.status === "done" ? "bg-primary" : "bg-border"
                    )}
                    aria-hidden
                  />
                )}
                <span
                  className={cn(
                    "relative z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
                    step.status === "done" &&
                      "border-primary bg-primary text-primary-foreground",
                    step.status === "active" &&
                      "border-primary bg-surface text-primary",
                    step.status === "pending" &&
                      "border-border-strong bg-surface text-muted-2"
                  )}
                >
                  {step.status === "done" ? (
                    <Check className="h-3.5 w-3.5" />
                  ) : step.status === "active" ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <span className="h-1.5 w-1.5 rounded-full bg-current" />
                  )}
                </span>
                <span
                  className={cn(
                    "pt-0.5 text-sm",
                    step.status === "pending"
                      ? "text-muted"
                      : "font-medium text-foreground"
                  )}
                >
                  {step.label}
                </span>
              </li>
            );
          })}
        </ol>
       
      </CardContent>
    </Card>
  );
}
