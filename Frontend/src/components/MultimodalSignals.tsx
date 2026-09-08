import {
  FileText,
  Image as ImageIcon,
  Mic,
  ShieldCheck,
  Video,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { DemoDataTag } from "@/components/states";
import type { ModalitySignal } from "@/types";

const iconMap = {
  text: FileText,
  image: ImageIcon,
  audio: Mic,
  video: Video,
  source: ShieldCheck,
} as const;

export function MultimodalSignals({
  signals,
}: {
  signals: ModalitySignal[];
}) {
  const active = signals.filter((s) => s.value > 0);
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <div>
          <CardTitle>Multimodal Evidence Signals</CardTitle>
          <p className="mt-1 text-sm text-muted">
            System signals across modalities — not calibrated probabilities.
          </p>
        </div>
        <DemoDataTag />
      </CardHeader>
      <CardContent className="space-y-4">
        {active.map((s) => {
          const Icon = iconMap[s.modality];
          return (
            <div key={s.modality}>
              <div className="mb-1.5 flex items-center justify-between">
                <span className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <Icon className="h-4 w-4 text-muted" />
                  {s.label}
                </span>
                <span className="text-sm font-semibold text-foreground tabular-nums">
                  {s.value}%
                </span>
              </div>
              <div className="h-2.5 w-full overflow-hidden rounded-full bg-surface-2">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-primary to-accent transition-all duration-700"
                  style={{ width: `${s.value}%` }}
                />
              </div>
            </div>
          );
        })}
        <p className="pt-1 text-xs text-muted-2">
          Labeled as <span className="font-medium">System Signals</span>. These
          indicate modality contribution to the overall assessment.
        </p>
      </CardContent>
    </Card>
  );
}
