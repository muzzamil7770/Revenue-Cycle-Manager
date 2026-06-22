import { useParams } from "wouter";
import { useGetPatient, useCheckEligibility, getCheckEligibilityQueryKey } from "@workspace/api-client-react";
import { formatCurrency, formatDate, formatPercent } from "@/lib/utils";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle, Phone, Mail, MapPin, User, Shield, RefreshCw } from "lucide-react";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

export default function PatientDetail() {
  const params = useParams<{ id: string }>();
  const id = parseInt(params.id ?? "0");
  const queryClient = useQueryClient();
  const [checkingEligibility, setCheckingEligibility] = useState(false);

  const { data: patient, isLoading } = useGetPatient(id, { query: { enabled: !!id } });
  const { data: eligibility, isLoading: eligibilityLoading } = useCheckEligibility(id, {
    query: { enabled: !!id, queryKey: getCheckEligibilityQueryKey(id) }
  });

  const handleRefreshEligibility = () => {
    setCheckingEligibility(true);
    queryClient.invalidateQueries({ queryKey: getCheckEligibilityQueryKey(id) });
    setTimeout(() => setCheckingEligibility(false), 1500);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-40" />)}
        </div>
      </div>
    );
  }

  if (!patient) return <div className="text-muted-foreground">Patient not found.</div>;

  const deductiblePct = eligibility ? (eligibility.deductibleMet / eligibility.deductible) * 100 : 0;
  const oopPct = eligibility ? (eligibility.outOfPocketMet / eligibility.outOfPocketMax) * 100 : 0;

  return (
    <div>
      <PageHeader
        title={`${patient.firstName} ${patient.lastName}`}
        subtitle={`MRN: ${patient.mrn} · Registered ${formatDate(patient.createdAt)}`}
        actions={<StatusBadge status={patient.status} />}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Demographics */}
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Demographics</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2 text-sm">
              <User className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              <span>DOB: {formatDate(patient.dob)}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Phone className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              <span>{patient.phone}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Mail className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              <span className="truncate">{patient.email}</span>
            </div>
            {patient.address && (
              <div className="flex items-start gap-2 text-sm">
                <MapPin className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                <span>{patient.address}, {patient.city}, {patient.state} {patient.zip}</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Financial */}
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Financial Summary</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Patient Balance</span>
              <span className="font-semibold text-destructive">{formatCurrency(patient.balance)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Primary Insurance</span>
              <span className="font-medium">{patient.primaryInsurance}</span>
            </div>
            {patient.secondaryInsurance && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Secondary</span>
                <span>{patient.secondaryInsurance}</span>
              </div>
            )}
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Provider</span>
              <span>{patient.provider || "—"}</span>
            </div>
          </CardContent>
        </Card>

        {/* Eligibility */}
        <Card>
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm">Insurance Eligibility</CardTitle>
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleRefreshEligibility} data-testid="button-refresh-eligibility">
              <RefreshCw className={`w-3.5 h-3.5 ${checkingEligibility ? "animate-spin" : ""}`} />
            </Button>
          </CardHeader>
          <CardContent>
            {eligibilityLoading || checkingEligibility ? (
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ) : eligibility ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-500" />
                  <span className="text-sm font-medium text-emerald-700 dark:text-emerald-400">Eligible</span>
                  <Shield className="w-3.5 h-3.5 text-muted-foreground ml-auto" />
                </div>
                <div className="text-xs text-muted-foreground space-y-1">
                  <div className="flex justify-between"><span>Plan</span><span className="font-medium text-foreground">{eligibility.planName}</span></div>
                  <div className="flex justify-between"><span>Copay</span><span className="font-medium text-foreground">{formatCurrency(eligibility.copay)}</span></div>
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-muted-foreground">Deductible Met</span>
                    <span>{formatCurrency(eligibility.deductibleMet)} / {formatCurrency(eligibility.deductible)}</span>
                  </div>
                  <Progress value={deductiblePct} className="h-1.5" />
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-muted-foreground">Out-of-Pocket Met</span>
                    <span>{formatCurrency(eligibility.outOfPocketMet)} / {formatCurrency(eligibility.outOfPocketMax)}</span>
                  </div>
                  <Progress value={oopPct} className="h-1.5" />
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Unable to check eligibility.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
