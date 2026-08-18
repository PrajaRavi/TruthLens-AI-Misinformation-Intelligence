import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

export function SearchBar({
  value,
  onChange,
  placeholder = "Search…",
  className,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  className?: string;
}) {
  return (
    <div className={cn("relative", className)}>
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className="h-10 w-full rounded-lg border border-border-strong bg-surface pl-9 pr-3 text-sm text-foreground placeholder:text-muted-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-primary"
      />
    </div>
  );
}

export interface FilterOption {
  value: string;
  label: string;
}

export function FilterChips({
  options,
  value,
  onChange,
  className,
}: {
  options: FilterOption[];
  value: string;
  onChange: (v: string) => void;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            onClick={() => onChange(o.value)}
            aria-pressed={active}
            className={cn(
              "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              active
                ? "border-primary bg-primary/10 text-primary"
                : "border-border-strong bg-surface text-muted hover:text-foreground hover:bg-surface-2"
            )}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
