import { useLocation } from "wouter";
import { useTheme } from "next-themes";
import { Bell, Moon, Sun, User, Menu, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

const routeLabels: Record<string, string> = {
  "/": "Dashboard",
  "/patients": "Patient Access",
  "/insurance": "Insurance & Payers",
  "/charges": "Charge Capture",
  "/coding": "Medical Coding",
  "/claims": "Claims Management",
  "/denials": "Denial Management",
  "/payments": "Payment Posting",
  "/billing": "Patient Billing",
  "/ar": "Accounts Receivable",
  "/reports": "Reporting & Analytics",
  "/admin": "Admin Panel",
};

function getBreadcrumbs(location: string) {
  const crumbs = [{ label: "HealthRCM", href: "/" }];
  const label = routeLabels[location] || Object.entries(routeLabels).find(([k]) => location.startsWith(k) && k !== "/")?.[1] || "Page";
  if (location !== "/") crumbs.push({ label, href: location });
  return crumbs;
}

interface NavbarProps {
  sidebarCollapsed: boolean;
  onToggleSidebar: () => void;
  onOpenMobileMenu: () => void;
}

export function Navbar({ onToggleSidebar, onOpenMobileMenu }: NavbarProps) {
  const [location] = useLocation();
  const { theme, setTheme } = useTheme();
  const crumbs = getBreadcrumbs(location);

  return (
    <header className="h-14 border-b border-border bg-card flex items-center px-4 gap-3 flex-shrink-0">
      {/* Mobile hamburger — visible only below md */}
      <button
        onClick={onOpenMobileMenu}
        data-testid="button-mobile-menu"
        className="md:hidden p-1.5 rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
      >
        <Menu className="w-4 h-4" />
      </button>
      {/* Desktop sidebar toggle — visible only md+ */}
      <button
        onClick={onToggleSidebar}
        data-testid="button-menu-toggle"
        className="hidden md:block p-1.5 rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
      >
        <Menu className="w-4 h-4" />
      </button>

      {/* Breadcrumb */}
      <nav className="flex items-center gap-1 flex-1 min-w-0">
        {crumbs.map((crumb, i) => (
          <div key={crumb.href} className="flex items-center gap-1">
            {i > 0 && <ChevronRight className="w-3 h-3 text-muted-foreground flex-shrink-0" />}
            <span className={cn(
              "text-sm truncate",
              i === crumbs.length - 1 ? "text-foreground font-medium" : "text-muted-foreground"
            )}>
              {crumb.label}
            </span>
          </div>
        ))}
      </nav>

      <div className="flex items-center gap-1">
        {/* Theme toggle */}
        <Button
          variant="ghost"
          size="icon"
          data-testid="button-theme-toggle"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="w-8 h-8"
        >
          {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </Button>

        {/* Notifications */}
        <Button variant="ghost" size="icon" data-testid="button-notifications" className="w-8 h-8 relative">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full" />
        </Button>

        {/* User menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" data-testid="button-user-menu" className="w-8 h-8">
              <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                <User className="w-3.5 h-3.5 text-primary-foreground" />
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>
              <div>
                <p className="font-medium text-sm">Admin User</p>
                <p className="text-xs text-muted-foreground">admin@healthsys.com</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Profile</DropdownMenuItem>
            <DropdownMenuItem>Settings</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive">Sign out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
