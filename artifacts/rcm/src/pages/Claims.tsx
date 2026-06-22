import { useState } from "react";
import { Link } from "wouter";
import { useListClaims, useGetClaimStats, getListClaimsQueryKey } from "@workspace/api-client-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { PageHeader } from "@/components/shared/PageHeader";
import { KpiCard } from "@/components/shared/KpiCard";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ExternalLink, FileText, CheckCircle, XCircle, Clock, AlertTriangle, ChevronLeft, ChevronRight } from "lucide-react";

const STATUSES = ["all", "pending", "submitted", "paid", "denied", "appealed"];

export default function Claims() {
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const limit = 10;

  const { data, isLoading } = useListClaims(
    { status: status === "all" ? undefined : status, page, limit },
    { query: { queryKey: getListClaimsQueryKey({ status: status === "all" ? undefined : status, page, limit }) } }
  );
  const { data: stats, isLoading: statsLoading } = useGetClaimStats();

  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / limit);

  return (
    <div>
      <PageHeader
        title="Claims Management"
        subtitle={`${total.toLocaleString()} total claims`}
      />

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
        <KpiCard title="Pending" value={(stats?.pending ?? 0).toLocaleString()} icon={Clock} variant="warning" isLoading={statsLoading} />
        <KpiCard title="Submitted" value={(stats?.submitted ?? 0).toLocaleString()} icon={FileText} variant="primary" isLoading={statsLoading} />
        <KpiCard title="Paid" value={(stats?.paid ?? 0).toLocaleString()} icon={CheckCircle} variant="success" isLoading={statsLoading} />
        <KpiCard title="Denied" value={(stats?.denied ?? 0).toLocaleString()} icon={XCircle} variant="danger" isLoading={statsLoading} />
        <KpiCard title="Appealed" value={(stats?.appealed ?? 0).toLocaleString()} icon={AlertTriangle} isLoading={statsLoading} />
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-4">
        {STATUSES.map(s => (
          <Button
            key={s}
            variant={status === s ? "default" : "outline"}
            size="sm"
            onClick={() => { setStatus(s); setPage(1); }}
            className="capitalize"
            data-testid={`filter-status-${s}`}
          >
            {s}
          </Button>
        ))}
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
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Service Date</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Billed</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Allowed</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Paid</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="border-b border-border">
                      {Array.from({ length: 9 }).map((_, j) => (
                        <td key={j} className="px-4 py-3"><Skeleton className="h-4 w-full" /></td>
                      ))}
                    </tr>
                  ))
                ) : (data?.data ?? []).map(claim => (
                  <tr key={claim.id} className="border-b border-border hover:bg-muted/20 transition-colors" data-testid={`row-claim-${claim.id}`}>
                    <td className="px-4 py-3 font-mono text-xs">{claim.claimNumber}</td>
                    <td className="px-4 py-3 font-medium">{claim.patientName}</td>
                    <td className="px-4 py-3 text-muted-foreground">{claim.payerName}</td>
                    <td className="px-4 py-3 text-muted-foreground">{formatDate(claim.serviceDate)}</td>
                    <td className="px-4 py-3">{formatCurrency(claim.totalCharge)}</td>
                    <td className="px-4 py-3">{claim.allowedAmount ? formatCurrency(claim.allowedAmount) : "—"}</td>
                    <td className="px-4 py-3">{claim.paidAmount ? formatCurrency(claim.paidAmount) : "—"}</td>
                    <td className="px-4 py-3"><StatusBadge status={claim.status} /></td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/claims/${claim.id}`}
                        className="p-1.5 rounded hover:bg-muted transition-colors inline-flex"
                        data-testid={`link-claim-${claim.id}`}
                      >
                        <ExternalLink className="w-4 h-4 text-muted-foreground" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-border">
              <p className="text-sm text-muted-foreground">Showing {((page - 1) * limit) + 1}–{Math.min(page * limit, total)} of {total}</p>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}><ChevronLeft className="w-4 h-4" /></Button>
                <span className="text-sm px-2">{page} / {totalPages}</span>
                <Button variant="ghost" size="sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}><ChevronRight className="w-4 h-4" /></Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
