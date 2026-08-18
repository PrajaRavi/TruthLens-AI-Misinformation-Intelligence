import { useRef, useState } from "react";
import { UploadCloud, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn, formatFileSize } from "@/lib/utils";

export interface UploadedFile {
  file: File;
  url: string;
}

interface UploadZoneProps {
  accept: string;
  formatsLabel: string;
  icon: React.ReactNode;
  onFile: (file: UploadedFile | null) => void;
  file: UploadedFile | null;
  preview?: (file: UploadedFile) => React.ReactNode;
}

export function UploadZone({
  accept,
  formatsLabel,
  icon,
  onFile,
  file,
  preview,
}: UploadZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [progress, setProgress] = useState(0);

  function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    const f = files[0];
    const url = URL.createObjectURL(f);
    // Simulate upload progress (frontend demo).
    setProgress(0);
    const timer = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          clearInterval(timer);
          onFile({ file: f, url });
          return 100;
        }
        return p + 20;
      });
    }, 80);
  }

  if (file) {
    return (
      <div className="rounded-xl border border-border bg-surface p-4">
        {preview && <div className="mb-3">{preview(file)}</div>}
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-foreground">
              {file.file.name}
            </p>
            <p className="text-xs text-muted">
              {formatFileSize(file.file.size)}
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              URL.revokeObjectURL(file.url);
              onFile(null);
              setProgress(0);
            }}
          >
            <X className="h-4 w-4" />
            Remove
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        handleFiles(e.dataTransfer.files);
      }}
      onClick={() => inputRef.current?.click()}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          inputRef.current?.click();
        }
      }}
      role="button"
      tabIndex={0}
      aria-label={`Upload file. Supported formats: ${formatsLabel}`}
      className={cn(
        "flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-12 text-center transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        dragging
          ? "border-primary bg-primary/5"
          : "border-border-strong hover:border-primary/50 hover:bg-surface-2/50"
      )}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-2 text-primary">
        {icon}
      </div>
      {progress > 0 && progress < 100 ? (
        <div className="mt-4 w-full max-w-xs">
          <div className="h-2 overflow-hidden rounded-full bg-surface-2">
            <div
              className="h-full bg-primary transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="mt-2 text-xs text-muted">Uploading… {progress}%</p>
        </div>
      ) : (
        <>
          <p className="mt-4 text-sm font-medium text-foreground">
            <span className="text-primary">Browse files</span> or drop here
          </p>
          <p className="mt-1 flex items-center gap-1 text-xs text-muted">
            <UploadCloud className="h-3.5 w-3.5" />
            Supported: {formatsLabel}
          </p>
        </>
      )}
    </div>
  );
}
