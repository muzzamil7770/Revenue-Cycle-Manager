import { useGetDashboardKpis, useGetRevenueTrend, useGetDashboardActivity, useGetPayerMix } from "@workspace/api-client-react";
import { formatCurrency, formatPercent, formatDatetime } from "@/lib/utils";
import { KpiCard } from "@/components/shared/KpiCard";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { DollarSign, FileText, AlertTriangle, TrendingUp, Clock, CheckCircle, XCircle, CreditCard } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, LineChart, Line, Area, AreaChart
} from "recharts";

const COLORS = ["#1d6ed4", "#22c55e", "#f59e0b", "#8b5cf6", "#ef4444", "#64748b"];

const activityIcons: Record<string, React.ElementType> = {
  claim_submitted: FileText,
  payment_posted: CreditCard,
  denial_received: XCircle,
  eligibility_check: CheckCircle,
  appeal_filed: AlertTriangle,
  patient_registered: CheckCircle,
  claim_paid: CheckCircle,
  coding_flag: AlertTriangle,
};

const activityColors: Record<string, string> = {
  claim_submitted: "text-blue-500",
  payment_posted: "text-emerald-500",
  denial_received: "text-red-500",
  eligibility_check: "text-teal-500",
  appeal_filed: "text-amber-500",
  patient_registered: "text-indigo-500",
  claim_paid: "text-emerald-500",
  coding_flag: "text-orange-500",
};

export default function Dashboard() {
  const { data: kpis, isLoading: kpisLoading } = useGetDashboardKpis();
  const { data: trend, isLoading: trendLoading } = useGetRevenueTrend();
  const { data: activity, isLoading: activityLoading } = useGetDashboardActivity();
  const { data: payerMix, isLoading: payerMixLoading } = useGetPayerMix();

  return (
    <div>
      <PageHeader
        title="Revenue Cycle Dashboard"
        subtitle={`Financial overview — ${new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })}`}
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <KpiCard
          title="Total Revenue"
          value={kpisLoading ? "—" : formatCurrency(kpis?.totalRevenue)}
          icon={DollarSign}
          trend={5.2}
          trendLabel="vs last month"
          variant="primary"
          isLoading={kpisLoading}
        />
        <KpiCard
          title="Collection Rate"
          value={kpisLoading ? "—" : formatPercent(kpis?.collectionRate)}
          icon={TrendingUp}
          trend={1.4}
          trendLabel="vs last month"
          variant="success"
          isLoading={kpisLoading}
        />
        <KpiCard
          title="Denial Rate"
          value={kpisLoading ? "—" : formatPercent(kpis?.denialRate)}
          icon={AlertTriangle}
          trend={-0.8}
          trendLabel="vs last month"
          variant="warning"
          isLoading={kpisLoading}
        />
        <KpiCard
          title="A/R Days"
          value={kpisLoading ? "—" : `${kpis?.arDays?.toFixed(1)} days`}
          icon={Clock}
          trend={-1.1}
          trendLabel="vs last month"
          variant="default"
          isLoading={kpisLoading}
        />
        <KpiCard
          title="Total Claims"
          value={kpisLoading ? "—" : (kpis?.totalClaims ?? 0).toLocaleString()}
          icon={FileText}
          variant="default"
          isLoading={kpisLoading}
        />
        <KpiCard
          title="Pending Claims"
          value={kpisLoading ? "—" : (kpis?.pendingClaims ?? 0).toLocaleString()}
          icon={FileText}
          variant="warning"
          isLoading={kpisLoading}
        />
        <KpiCard
          title="Open Denials"
          value={kpisLoading ? "—" : (kpis?.openDenials ?? 0).toLocaleString()}
          icon={XCircle}
          variant="danger"
          isLoading={kpisLoading}
        />
        <KpiCard
          title="Payments This Month"
          value={kpisLoading ? "—" : formatCurrency(kpis?.paymentsThisMonth)}
          icon={CreditCard}
          variant="success"
          isLoading={kpisLoading}
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        {/* Revenue trend */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Revenue Trend (12 Months)</CardTitle>
          </CardHeader>
          <CardContent>
            {trendLoading ? (
              <Skeleton className="h-56 w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={trend ?? []} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#1d6ed4" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#1d6ed4" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22c55e" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="hsl(var(--border))" />
                  <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--border))"
                    tickFormatter={v => `$${(v / 1000000).toFixed(1)}M`} />
                  <Tooltip formatter={(v: number) => formatCurrency(v)} />
                  <Area type="monotone" dataKey="revenue" stroke="#1d6ed4" fill="url(#revGrad)" strokeWidth={2} name="Revenue" />
                  <Area type="monotone" dataKey="collections" stroke="#22c55e" fill="url(#colGrad)" strokeWidth={2} name="Collections" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Payer Mix */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Payer Mix</CardTitle>
          </CardHeader>
          <CardContent>
            {payerMixLoading ? (
              <Skeleton className="h-56 w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={payerMix ?? []}
                    cx="50%"
                    cy="45%"
                    innerRadius={55}
                    outerRadius={80}
                    dataKey="percentage"
                    nameKey="payer"
                  >
                    {(payerMix ?? []).map((_entry, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Legend
                    formatter={(value) => <span style={{ fontSize: 11 }}>{value}</span>}
                  />
                  <Tooltip formatter={(v: number) => `${v.toFixed(1)}%`} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Activity feed */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          {activityLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-12 w-full" />)}
            </div>
          ) : (
            <div className="divide-y divide-border">
              {(activity ?? []).map((item) => {
                const Icon = activityIcons[item.type] ?? FileText;
                const color = activityColors[item.type] ?? "text-muted-foreground";
                return (
                  <div key={item.id} className="flex items-start gap-3 py-3" data-testid={`activity-item-${item.id}`}>
                    <div className={`mt-0.5 ${color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-foreground">{item.description}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{item.user} · {formatDatetime(item.timestamp)}</p>
                    </div>
                    {item.meta && (
                      <span className="text-sm font-medium text-foreground flex-shrink-0">{item.meta}</span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
