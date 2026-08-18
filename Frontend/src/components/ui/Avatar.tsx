import { cn } from "@/lib/utils";

interface AvatarProps {
  name: string;
  src?: string;
  className?: string;
}

function initials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function Avatar({ name, src, className }: AvatarProps) {
  return (
    <span
      className={cn(
        "inline-flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-primary to-accent text-xs font-semibold text-white",
        className
      )}
      aria-hidden={!!src}
    >
      {src ? (
                <img src={src} alt={name} className="h-full w-full object-cover" />
      ) : (
        initials(name)
      )}
    </span>
  );
}
