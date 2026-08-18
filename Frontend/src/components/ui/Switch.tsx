import { cn } from "@/lib/utils";

interface SwitchProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  id?: string;
  label?: string;
  disabled?: boolean;
}

export function Switch({
  checked,
  onCheckedChange,
  id,
  label,
  disabled,
}: SwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      id={id}
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onCheckedChange(!checked)}
      className={cn(
        "relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        "disabled:cursor-not-allowed disabled:opacity-50",
        checked ? "bg-primary" : "bg-border-strong"
      )}
    >
      <span
        className="inline-block transform rounded-full bg-white shadow transition-transform"
        style={{
          height: "1.125rem",
          width: "1.125rem",
          transform: checked ? "translateX(1.375rem)" : "translateX(0.125rem)",
        }}
      />
    </button>
  );
}
