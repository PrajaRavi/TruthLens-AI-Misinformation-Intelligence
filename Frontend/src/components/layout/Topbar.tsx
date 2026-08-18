import Link from "@/router";
import { usePathname } from "@/router";
import { Bell, HelpCircle, Menu, Plus, Search } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { ThemeToggle } from "@/components/theme";
import { pageTitle } from "@/components/layout/nav";
import { currentUser } from "@/data/mockData";
import { useUser } from "@/context/counterContext";

export function Topbar({ onMenuClick }: { onMenuClick: () => void }) {
  const pathname = usePathname();
  const title = pageTitle(pathname);
  const {user}=useUser()
  

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-surface/80 backdrop-blur-md">
      <div className="flex h-16 items-center gap-3 px-4 sm:px-6">
        <button
          onClick={onMenuClick}
          aria-label="Open navigation"
          className="flex h-9 w-9 items-center justify-center rounded-lg text-muted transition-colors hover:bg-surface-2 hover:text-foreground lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>

        <h1 className="text-base font-semibold text-foreground sm:text-lg">
          {title}
        </h1>

        {/* Search - desktop */}
        {/* <div className="relative ml-6 hidden max-w-xs flex-1 md:block">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <input
            type="search"
            placeholder="Search analyses, claims, sources…"
            aria-label="Global search"
            className="h-9 w-full rounded-lg border border-border-strong bg-surface-2/60 pl-9 pr-3 text-sm text-foreground placeholder:text-muted-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-primary"
          />
        </div> */}

        <div className="ml-auto flex items-center gap-1 sm:gap-2">
          <button
            aria-label="Help"
            className="hidden h-9 w-9 items-center justify-center rounded-lg text-muted transition-colors hover:bg-surface-2 hover:text-foreground sm:flex"
          >
            <HelpCircle className="h-5 w-5" />
          </button>
          <button
            aria-label="Notifications"
            className="relative flex h-9 w-9 items-center justify-center rounded-lg text-muted transition-colors hover:bg-surface-2 hover:text-foreground"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-risk-critical ring-2 ring-surface" />
          </button>
          <ThemeToggle />

          <Link
            href="/analyze"
            className="ml-1 hidden h-9 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground shadow-sm shadow-primary/20 transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:inline-flex"
          >
            <Plus className="h-4 w-4" />
            New Analysis
          </Link>
          <Link
            href="/analyze"
            aria-label="New Analysis"
            className="ml-1 flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground sm:hidden"
          >
            <Plus className="h-5 w-5" />
          </Link>

          <Link href="/settings" className="ml-1" aria-label="Profile settings">
            <Avatar name={user?.name} src={currentUser.avatarUrl} />
          </Link>
        </div>
      </div>
    </header>
  );
}
