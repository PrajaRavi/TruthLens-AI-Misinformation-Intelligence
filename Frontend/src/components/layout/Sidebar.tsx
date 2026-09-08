import Link, { useRouter } from "@/router";
import { usePathname } from "@/router";
import { LogOut, ScanEye, Settings } from "lucide-react";
import { navItems } from "@/components/layout/nav";
import { Avatar } from "@/components/ui/Avatar";
import { currentUser } from "@/data/mockData";
import { cn } from "@/lib/utils";
import { useUser } from "@/context/counterContext";
import { localUser } from "@/lib/constants";


function isActive(href: string, pathname: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const router=useRouter()
  const {user}=useUser()
  
  return (
    <div className="flex h-full flex-col bg-surface">
      {/* Logo */}
      <div   className="flex items-center cursor-pointer gap-2.5 border-b border-border px-5 py-4">
        <div onClick={()=>{
        router.push("/")
      }} className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent text-white shadow-sm">
          <ScanEye className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm font-bold leading-tight text-foreground">
            TruthLens AI
          </p>
          <p className="text-[11px] leading-tight text-muted">
            AI-Powered Misinformation Intelligence
          </p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {navItems.map((item) => {
          const active = isActive(item.href, pathname);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                active
                  ? "bg-primary/10 text-primary"
                  : "text-muted hover:bg-surface-2 hover:text-foreground"
              )}
            >
              <Icon
                className={cn(
                  "h-[18px] w-[18px] shrink-0",
                  active ? "text-primary" : "text-muted-2"
                )}
              />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Footer / profile */}
      <div className="border-t border-border p-3">
        <div className="flex items-center gap-3 rounded-lg px-2 py-2">
          <Avatar name={user?.name} src={currentUser.avatarUrl} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-foreground">
              {user?.name}
            </p>
            {/* <p className="truncate text-xs text-muted">{currentUser.role}</p> */}
          </div>
        </div>
        <div className="mt-1 flex items-center gap-1">
          <Link
            href="/settings"
            onClick={onNavigate}
            className="flex flex-1 items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted transition-colors hover:bg-surface-2 hover:text-foreground"
          >
            <Settings className="h-4 w-4" />
            Settings
          </Link>
          <Link
            href="/login"
            onClick={()=>{
            localStorage.removeItem(localUser)  

            }}
            className="flex flex-1 items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted transition-colors hover:bg-surface-2 hover:text-risk-critical"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </Link>
        </div>
      </div>
    </div>
  );
}

export function Sidebar() {
  return (
    <aside className="hidden w-64 shrink-0 border-r border-border lg:block">
      <div className="sticky top-0 h-screen">
        <SidebarContent />
      </div>
    </aside>
  );
}
