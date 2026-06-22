import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard, Users, Shield, FileText, Code2, ClipboardList,
  XCircle, CreditCard, Receipt, BarChart3, TrendingUp, FileBarChart,
  Settings, ChevronLeft, ChevronRight, Activity
} from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const navSections: NavSection[] = [
  {
    title: "Overview",
    items: [
      { label: "Dashboard", href: "/", icon: LayoutDashboard },
    ],
  },
  {
    title: "Revenue Cycle",
    items: [
      { label: "Patient Access", href: "/patients", icon: Users },
      { label: "Insurance & Payers", href: "/insurance", icon: Shield },
      { label: "Charge Capture", href: "/charges", icon: FileText },
      { label: "Medical Coding", href: "/coding", icon: Code2 },
      { label: "Claims", href: "/claims", icon: ClipboardList },
      { label: "Denial Management", href: "/denials", icon: XCircle },
    ],
  },
  {
    title: "Financial",
    items: [
      { label: "Payment Posting", href: "/payments", icon: CreditCard },
      { label: "Patient Billing", href: "/billing", icon: Receipt },
      { label: "Accounts Receivable", href: "/ar", icon: BarChart3 },
      { label: "Reporting", href: "/reports", icon: FileBarChart },
    ],
  },
  {
    title: "Administration",
    items: [
      { label: "Admin Panel", href: "/admin", icon: Settings },
    ],
  },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const [location] = useLocation();

  return (
    <aside
      className={cn(
        "flex flex-col bg-sidebar border-r border-sidebar-border transition-all duration-200 ease-in-out flex-shrink-0",
        collapsed ? "w-16" : "w-60"
      )}
    >
      {/* Logo */}
      <div className={cn(
        "flex items-center h-14 border-b border-sidebar-border flex-shrink-0 px-4",
        collapsed ? "justify-center" : "justify-between"
      )}>
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-sidebar-primary flex items-center justify-center flex-shrink-0">
              <Activity className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-sm font-bold text-white leading-tight">HealthRCM</p>
              <p className="text-[10px] text-sidebar-foreground/60 leading-tight">Revenue Cycle</p>
            </div>
          </div>
        )}
        {collapsed && (
          <div className="w-7 h-7 rounded-md bg-sidebar-primary flex items-center justify-center">
            <Activity className="w-4 h-4 text-white" />
          </div>
        )}
        <button
          onClick={onToggle}
          data-testid="button-toggle-sidebar"
          className={cn(
            "p-1 rounded text-sidebar-foreground/50 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-colors",
            collapsed && "hidden"
          )}
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-4">
        {navSections.map((section) => (
          <div key={section.title}>
            {!collapsed && (
              <p className="text-[10px] font-semibold uppercase tracking-wider text-sidebar-foreground/40 px-2 mb-1">
                {section.title}
              </p>
            )}
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const isActive = item.href === "/" ? location === "/" : location.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    data-testid={`nav-${item.href.replace("/", "") || "dashboard"}`}
                    className={cn(
                      "flex items-center gap-3 px-2 py-2 rounded-md text-sm transition-colors",
                      collapsed ? "justify-center" : "",
                      isActive
                        ? "bg-sidebar-primary/20 text-sidebar-primary font-medium"
                        : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent"
                    )}
                    title={collapsed ? item.label : undefined}
                  >
                    <item.icon className={cn("flex-shrink-0", collapsed ? "w-5 h-5" : "w-4 h-4")} />
                    {!collapsed && <span className="truncate">{item.label}</span>}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Collapse toggle for collapsed state */}
      {collapsed && (
        <div className="p-2 border-t border-sidebar-border">
          <button
            onClick={onToggle}
            data-testid="button-expand-sidebar"
            className="w-full flex justify-center p-2 rounded text-sidebar-foreground/50 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </aside>
  );
}
