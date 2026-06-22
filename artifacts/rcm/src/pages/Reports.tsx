import { useGetReportKpis, useGetPayerPerformance, useGetProviderProductivity } from "@workspace/api-client-react";
import { formatCurrency, formatPercent, formatNumber } from "@/lib/utils";
import { PageHeader } from "@/components/shared/PageHeader";
import { KpiCard } from "@/components/shared/KpiCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { FileBarChart, Users, TrendingUp } from "lucide-react";

export default function Reports() {
  const { data: kpis, isLoading: kpisLoading } = useGetReportKpis();
  const { data: payerPerf, isLoading: payerPerfLoading } = useGetPayerPerformance();
  const { data: provProd, isLoading: provProdLoading } = useGetProviderProductivity();

  return (
    <div>
      <PageHeader title="Reporting & Analytics" subtitle="Financial performance metrics and operational insights" />

      {/* KPI Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <KpiCard title="Net Revenue" value={formatCurrency(kpis?.netRevenue)} icon={TrendingUp} variant="primary" isLoading={kpisLoading} />
        <KpiCard title="Collection Rate" value={formatPercent(kpis?.collectionRate)} icon={TrendingUp} variant="success" isLoading={kpisLoading} />
        <KpiCard title="Denial Rate" value={formatPercent(kpis?.denialRate)} variant="warning" isLoading={kpisLoading} />
        <KpiCard title="A/R Days" value={`${kpis?.arDays?.toFixed(1) ?? "—"} days`} isLoading={kpisLoading} />
        <KpiCard title="Total Charges" value={formatCurrency(kpis?.totalCharges)} isLoading={kpisLoading} />
        <KpiCard title="Total Collections" value={formatCurrency(kpis?.totalCollections)} variant="success" isLoading={kpisLoading} />
        <KpiCard title="Total Adjustments" value={formatCurrency(kpis?.totalAdjustments)} variant="warning" isLoading={kpisLoading} />
        <KpiCard title="Claim Count" value={formatNumber(kpis?.claimCount)} isLoading={kpisLoading} />
      </div>

      <Tabs defaultValue="payer">
        <TabsList className="mb-4">
          <TabsTrigger value="payer"><FileBarChart className="w-3.5 h-3.5 mr-1.5" />Payer Performance</TabsTrigger>
          <TabsTrigger value="provider"><Users className="w-3.5 h-3.5 mr-1.5" />Provider Productivity</TabsTrigger>
        </TabsList>

        <TabsContent value="payer">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">Collection Rate by Payer</CardTitle></CardHeader>
              <CardContent>
                {payerPerfLoading ? <Skeleton className="h-48 w-full" /> : (
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={payerPerf ?? []} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="payerName" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `${v}%`} domain={[60, 100]} />
                      <Tooltip formatter={(v: number) => `${v.toFixed(1)}%`} />
                      <Bar dataKey="collectionRate" fill="#1d6ed4" radius={[3,3,0,0]} name="Collection Rate" />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border bg-muted/30">
                        <th className="text-left px-4 py-3 font-medium text-muted-foreground">Payer</th>
                        <th className="text-left px-4 py-3 font-medium text-muted-foreground">Claims</th>
                        <th className="text-left px-4 py-3 font-medium text-muted-foreground">Denial Rate</th>
                        <th className="text-left px-4 py-3 font-medium text-muted-foreground">Avg Days</th>
                        <th className="text-left px-4 py-3 font-medium text-muted-foreground">Total Paid</th>
                      </tr>
                    </thead>
                    <tbody>
                      {payerPerfLoading ? Array.from({ length: 4 }).map((_, i) => (
                        <tr key={i} className="border-b border-border">{Array.from({ length: 5 }).map((_, j) => <td key={j} className="px-4 py-3"><Skeleton className="h-4 w-full" /></td>)}</tr>
                      )) : (payerPerf ?? []).map(p => (
                        <tr key={p.payerName} className="border-b border-border hover:bg-muted/20 transition-colors">
                          <td className="px-4 py-3 font-medium">{p.payerName}</td>
                          <td className="px-4 py-3">{p.claimsSubmitted.toLocaleString()}</td>
                          <td className="px-4 py-3"><span className={p.denialRate > 15 ? "text-destructive font-medium" : ""}>{formatPercent(p.denialRate)}</span></td>
                          <td className="px-4 py-3">{p.avgReimbursementDays.toFixed(1)}d</td>
                          <td className="px-4 py-3 font-medium">{formatCurrency(p.totalPaid)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="provider">
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/30">
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">Provider</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">Specialty</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">Total Charges</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">Collections</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">Claims</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">Avg/Encounter</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">RVU</th>
                    </tr>
                  </thead>
                  <tbody>
                    {provProdLoading ? Array.from({ length: 4 }).map((_, i) => (
                      <tr key={i} className="border-b border-border">{Array.from({ length: 7 }).map((_, j) => <td key={j} className="px-4 py-3"><Skeleton className="h-4 w-full" /></td>)}</tr>
                    )) : (provProd ?? []).map(p => (
                      <tr key={p.providerName} className="border-b border-border hover:bg-muted/20 transition-colors">
                        <td className="px-4 py-3 font-medium">{p.providerName}</td>
                        <td className="px-4 py-3 text-muted-foreground">{p.specialty}</td>
                        <td className="px-4 py-3">{formatCurrency(p.totalCharges)}</td>
                        <td className="px-4 py-3 font-medium text-emerald-700 dark:text-emerald-400">{formatCurrency(p.totalCollections)}</td>
                        <td className="px-4 py-3">{p.claimsCount.toLocaleString()}</td>
                        <td className="px-4 py-3">{formatCurrency(p.avgChargePerEncounter)}</td>
                        <td className="px-4 py-3">{p.rvu.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
