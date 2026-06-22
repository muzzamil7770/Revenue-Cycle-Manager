import { useState } from "react";
import { useListDenials, useGetDenialSummary, useUpdateDenial, getListDenialsQueryKey, getGetDenialSummaryQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { formatCurrency, formatDate } from "@/lib/utils";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { AlertTriangle, FileWarning } from "lucide-react";

const COLORS = ["#ef4444", "#f97316", "#f59e0b", "#84cc16", "#3b82f6", "#8b5cf6"];

export default function Denials() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [appealNotes, setAppealNotes] = useState("");

  const { data: denials, isLoading } = useListDenials();
  const { data: summary, isLoading: summaryLoading } = useGetDenialSummary();
  const updateDenial = useUpdateDenial();

  const selected = (denials ?? []).find(d => d.id === selectedId);

  const handleAppeal = () => {
    if (!selectedId) return;
    updateDenial.mutate({ denialId: selectedId, data: { status: "appealed", appealNotes, appealDate: new Date().toISOString().split("T")[0] } }, {
      onSuccess: () => {
        toast({ title: "Appeal filed successfully" });
        queryClient.invalidateQueries({ queryKey: getListDenialsQueryKey() });
        setSelectedId(null);
        setAppealNotes("");
      },
      onError: () => toast({ title: "Failed to file appeal", variant: "destructive" }),
    });
  };

  const totalAmount = (denials ?? []).reduce((sum, d) => sum + Number(d.amount), 0);
  const openCount = (denials ?? []).filter(d => d.status === "open").length;

  return (
    <div>
      <PageHeader
        title="Denial Management"
        subtitle={`${openCount} open denials · ${formatCurrency(totalAmount)} at risk`}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        {/* Summary chart */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2"><CardTitle className="text-sm">Denial Root Cause Analysis</CardTitle></CardHeader>
          <CardContent>
            {summaryLoading ? (
              <Skeleton className="h-48 w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={summary ?? []} layout="vertical" margin={{ left: 16, right: 16 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 11 }} tickFormatter={v => `$${(v/1000).toFixed(0)}k`} />
                  <YAxis type="category" dataKey="rootCause" tick={{ fontSize: 11 }} width={120} />
                  <Tooltip formatter={(v: number) => formatCurrency(v)} />
                  <Bar dataKey="amount" radius={[0, 3, 3, 0]} name="Amount at Risk">
                    {(summary ?? []).map((_, idx) => (
                      <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="space-y-3">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Open Denials</p>
                <p className="text-xl font-bold">{openCount}</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                <FileWarning className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Amount At Risk</p>
                <p className="text-xl font-bold">{formatCurrency(totalAmount)}</p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Claim #</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Patient</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Payer</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Denial Date</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Root Cause</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Amount</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Days Left</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <tr key={i} className="border-b border-border">
                      {Array.from({ length: 9 }).map((_, j) => (
                        <td key={j} className="px-4 py-3"><Skeleton className="h-4 w-full" /></td>
                      ))}
                    </tr>
                  ))
                ) : (denials ?? []).map(denial => (
                  <tr key={denial.id} className="border-b border-border hover:bg-muted/20 transition-colors" data-testid={`row-denial-${denial.id}`}>
                    <td className="px-4 py-3 font-mono text-xs">{denial.claimNumber}</td>
                    <td className="px-4 py-3 font-medium">{denial.patientName}</td>
                    <td className="px-4 py-3 text-muted-foreground">{denial.payerName}</td>
                    <td className="px-4 py-3 text-muted-foreground">{formatDate(denial.denialDate)}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded text-xs">{denial.rootCause}</span>
                    </td>
                    <td className="px-4 py-3 font-medium">{formatCurrency(denial.amount)}</td>
                    <td className="px-4 py-3">
                      <span className={denial.daysToAppeal <= 7 ? "text-destructive font-semibold" : ""}>
                        {denial.daysToAppeal} days
                      </span>
                    </td>
                    <td className="px-4 py-3"><StatusBadge status={denial.status} /></td>
                    <td className="px-4 py-3">
                      {denial.status === "open" && (
                        <Button size="sm" variant="outline" onClick={() => setSelectedId(denial.id)} data-testid={`button-appeal-${denial.id}`}>
                          Appeal
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={!!selectedId} onOpenChange={() => setSelectedId(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>File Appeal — {selected?.claimNumber}</DialogTitle></DialogHeader>
          <div className="py-3 space-y-3">
            <div className="text-sm space-y-1">
              <p><span className="text-muted-foreground">Denial Reason:</span> {selected?.denialReason}</p>
              <p><span className="text-muted-foreground">Amount:</span> {formatCurrency(selected?.amount)}</p>
            </div>
            <div>
              <Label>Appeal Notes</Label>
              <Textarea
                value={appealNotes}
                onChange={e => setAppealNotes(e.target.value)}
                placeholder="Document the basis for the appeal..."
                rows={4}
                data-testid="textarea-appeal-notes"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedId(null)}>Cancel</Button>
            <Button onClick={handleAppeal} disabled={updateDenial.isPending || !appealNotes.trim()}>
              {updateDenial.isPending ? "Filing..." : "File Appeal"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
