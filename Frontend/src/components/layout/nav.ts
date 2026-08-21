import {
  BarChart3,
  FileSearch,
  FileText,
  History,
  LayoutDashboard,
  ScanSearch,
  Settings,
  ShieldCheck,
  Sparkles,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

export const navItems: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Analyze Content", href: "/analyze", icon: ScanSearch },
  // { label: "Analysis History", href: "/history", icon: History },
  // { label: "Source Verification", href: "/sources", icon: ShieldCheck },
  { label: "Claim Explorer", href: "/claims", icon: FileSearch },
  // { label: "Reports", href: "/reports", icon: FileText },
  { label: "AI Insights", href: "/insights", icon: Sparkles },
  { label: "Settings", href: "/settings", icon: Settings },
];

export const iconExtras = { BarChart3 };

export function pageTitle(pathname: string): string {
  const item = navItems.find(
    (n) => n.href === pathname || (n.href !== "/" && pathname.startsWith(n.href))
  );
  if (pathname === "/") return "Dashboard";
  return item?.label ?? "TruthLens AI";
}
