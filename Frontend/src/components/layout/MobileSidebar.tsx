import { X } from "lucide-react";
import { useEffect } from "react";
import { SidebarContent } from "@/components/layout/Sidebar";

export function MobileSidebar({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
        aria-hidden
      />
      <div className="absolute inset-y-0 left-0 w-72 max-w-[85%] animate-fade-in-up shadow-2xl">
        <button
          onClick={onClose}
          aria-label="Close navigation"
          className="absolute right-3 top-3 z-10 rounded-lg p-1.5 text-muted hover:bg-surface-2 hover:text-foreground"
        >
          <X className="h-5 w-5" />
        </button>
        <SidebarContent onNavigate={onClose} />
      </div>
    </div>
  );
}
