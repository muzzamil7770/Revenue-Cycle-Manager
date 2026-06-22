import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, TrendingDown } from "lucide-react";

interface KpiCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ElementType;
  trend?: number;
  trendLabel?: string;
  variant?: "default" | "success" | "warning" | "danger" | "primary";
  isLoading?: boolean;
  className?: string;
}

const variantIconBg: Record<string, string> = {
  default:  "bg-muted text-muted-foreground",
  success:  "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  warning:  "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  danger:   "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  primary:  "bg-primary/10 text-primary",
};

export function KpiCard({
  title, value, subtitle, icon: Icon, trend, trendLabel, variant = "default", isLoading, className
}: KpiCardProps) {
  if (isLoading) {
    return (
      <Card className={cn("p-5", className)}>
        <Skeleton className="h-4 w-24 mb-3" />
        <Skeleton className="h-7 w-32 mb-2" />
        <Skeleton className="h-3 w-20" />
      </Card>
    );
  }

  const positive = trend !== undefined && trend >= 0;

  return (
    <Card className={cn("p-5", className)} data-testid="card-kpi">
      <CardContent className="p-0">
        <div className="flex items-start justify-between mb-3">
          <p className="text-sm text-muted-foreground font-medium">{title}</p>
          {Icon && (
            <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", variantIconBg[variant])}>
              <Icon className="w-4 h-4" />
            </div>
          )}
        </div>
        <p className="text-2xl font-bold text-foreground mb-1" data-testid="text-kpi-value">{value}</p>
        {(subtitle || trend !== undefined) && (
          <div className="flex items-center gap-2">
            {trend !== undefined && (
              <div className={cn("flex items-center gap-0.5 text-xs font-medium",
                positive ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"
              )}>
                {positive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {positive ? "+" : ""}{trend.toFixed(1)}%
              </div>
            )}
            {subtitle && <p className="text-xs text-muted-foreground">{trendLabel ?? subtitle}</p>}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
