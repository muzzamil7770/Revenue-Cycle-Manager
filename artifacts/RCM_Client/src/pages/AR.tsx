import { useGetArAging, useGetArWorklist } from "@workspace/api-client-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

const AGING_COLORS = ["#22c55e", "#3b82f6", "#f59e0b", "#ef4444", "#7f1d1d"];

export default function AR() {
  const { data: aging, isLoading: agingLoading } = useGetArAging();
  const { data: worklist, isLoading: worklistLoading } = useGetArWorklist();

  return (
    <div>
      <PageHeader
        title="Accounts Receivable"
        subtitle={agingLoading ? "Loading..." : `${formatCurrency(aging?.total)} total outstanding`}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        {/* Aging Chart */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2"><CardTitle className="text-sm">A/R Aging Buckets</CardTitle></CardHeader>
          <CardContent>
            {agingLoading ? <Skeleton className="h-48 w-full" /> : (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={aging?.buckets ?? []} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="label" tick={{ fontSize: 10 }} stroke="hsl(var(--border))" />
                  <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--border))" tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} />
                  <Tooltip formatter={(v: number) => formatCurrency(v)} />
                  <Bar dataKey="amount" radius={[3, 3, 0, 0]} name="Amount">
                    {(aging?.buckets ?? []).map((_, idx) => <Cell key={idx} fill={AGING_COLORS[idx % AGING_COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Buckets summary */}
        <div className="space-y-2">
          {agingLoading ? Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12" />) :
            (aging?.buckets ?? []).map((bucket, idx) => (
              <Card key={bucket.label} className="p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: AGING_COLORS[idx] }} />
                    <span className="text-xs font-medium">{bucket.label}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold">{formatCurrency(bucket.amount)}</p>
                    <p className="text-xs text-muted-foreground">{bucket.count} claims</p>
                  </div>
                </div>
              </Card>
            ))
          }
        </div>
      </div>

      {/* Worklist */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm">Follow-Up Worklist</CardTitle></CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Claim #</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Patient</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Payer</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Amount</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Age</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Priority</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Assignee</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Last Action</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Next Action</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Due</th>
                </tr>
              </thead>
              <tbody>
                {worklistLoading ? Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i} className="border-b border-border">{Array.from({ length: 10 }).map((_, j) => <td key={j} className="px-4 py-3"><Skeleton className="h-4 w-full" /></td>)}</tr>
                )) : (worklist ?? []).map(item => (
                  <tr key={item.id} className="border-b border-border hover:bg-muted/20 transition-colors" data-testid={`row-worklist-${item.id}`}>
                    <td className="px-4 py-3 font-mono text-xs">{item.claimNumber}</td>
                    <td className="px-4 py-3 font-medium">{item.patientName}</td>
                    <td className="px-4 py-3 text-muted-foreground">{item.payerName}</td>
                    <td className="px-4 py-3 font-semibold">{formatCurrency(item.amount)}</td>
                    <td className="px-4 py-3">
                      <span className={item.ageDays > 90 ? "text-destructive font-semibold" : ""}>{item.ageDays}d</span>
                    </td>
                    <td className="px-4 py-3"><StatusBadge status={item.priority} /></td>
                    <td className="px-4 py-3 text-muted-foreground">{item.assignee}</td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">{item.lastAction}</td>
                    <td className="px-4 py-3 text-xs">{item.nextAction}</td>
                    <td className="px-4 py-3 text-muted-foreground">{formatDate(item.dueDate)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
