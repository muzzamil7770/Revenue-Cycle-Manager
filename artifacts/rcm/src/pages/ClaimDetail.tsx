import { useParams } from "wouter";
import { useGetClaim, useSubmitClaim, getGetClaimQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { formatCurrency, formatDate } from "@/lib/utils";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Send } from "lucide-react";

export default function ClaimDetail() {
  const params = useParams<{ id: string }>();
  const id = parseInt(params.id ?? "0");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: claim, isLoading } = useGetClaim(id, { query: { enabled: !!id, queryKey: getGetClaimQueryKey(id) } });
  const submitClaim = useSubmitClaim();

  const handleSubmit = () => {
    submitClaim.mutate({ claimId: id }, {
      onSuccess: () => {
        toast({ title: "Claim submitted successfully" });
        queryClient.invalidateQueries({ queryKey: getGetClaimQueryKey(id) });
      },
      onError: () => toast({ title: "Failed to submit claim", variant: "destructive" }),
    });
  };

  if (isLoading) return (
    <div className="space-y-4">
      <Skeleton className="h-8 w-64" />
      <div className="grid grid-cols-2 gap-4">{[1,2,3,4].map(i => <Skeleton key={i} className="h-32" />)}</div>
    </div>
  );

  if (!claim) return <div className="text-muted-foreground">Claim not found.</div>;

  const diagCodes = Array.isArray(claim.diagnosisCodes) ? claim.diagnosisCodes : [];
  const procCodes = Array.isArray(claim.procedureCodes) ? claim.procedureCodes : [];

  return (
    <div>
      <PageHeader
        title={claim.claimNumber}
        subtitle={`${claim.patientName} · ${claim.payerName}`}
        actions={
          <div className="flex items-center gap-2">
            <StatusBadge status={claim.status} />
            {claim.status === "pending" && (
              <Button onClick={handleSubmit} disabled={submitClaim.isPending} size="sm" data-testid="button-submit-claim">
                <Send className="w-3.5 h-3.5 mr-1.5" />
                {submitClaim.isPending ? "Submitting..." : "Submit Claim"}
              </Button>
            )}
          </div>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Claim Information</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            {[
              ["Claim Number", claim.claimNumber],
              ["Claim Type", claim.claimType],
              ["Service Date", formatDate(claim.serviceDate)],
              ["Submitted Date", formatDate(claim.submittedDate)],
              ["Provider", claim.providerName],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between py-1 border-b border-border last:border-0">
                <span className="text-muted-foreground">{label}</span>
                <span className="font-medium">{value}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Financial Breakdown</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            {[
              ["Total Billed", formatCurrency(claim.totalCharge)],
              ["Allowed Amount", claim.allowedAmount ? formatCurrency(claim.allowedAmount) : "—"],
              ["Insurance Paid", claim.paidAmount ? formatCurrency(claim.paidAmount) : "—"],
              ["Adjustment", claim.adjustmentAmount ? formatCurrency(claim.adjustmentAmount) : "—"],
              ["Patient Balance", formatCurrency(claim.patientBalance)],
            ].map(([label, value]) => (
              <div key={label} className={`flex justify-between py-1 border-b border-border last:border-0 ${label === "Patient Balance" ? "font-semibold" : ""}`}>
                <span className="text-muted-foreground">{label}</span>
                <span>{value}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Diagnosis Codes (ICD-10)</CardTitle></CardHeader>
          <CardContent>
            {diagCodes.length === 0 ? (
              <p className="text-sm text-muted-foreground">None specified</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {diagCodes.map(code => (
                  <span key={code} className="px-2 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded text-xs font-mono">{code}</span>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Procedure Codes (CPT)</CardTitle></CardHeader>
          <CardContent>
            {procCodes.length === 0 ? (
              <p className="text-sm text-muted-foreground">None specified</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {procCodes.map(code => (
                  <span key={code} className="px-2 py-1 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 rounded text-xs font-mono">{code}</span>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
