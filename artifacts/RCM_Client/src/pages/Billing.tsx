import { useListStatements, useListPaymentPlans, useCreatePaymentPlan, getListPaymentPlansQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { formatCurrency, formatDate } from "@/lib/utils";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Plus, Receipt, CreditCard } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Progress } from "@/components/ui/progress";

interface PlanForm { patientId: number; totalAmount: number; monthlyAmount: number; startDate: string; }

export default function Billing() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: statements, isLoading: statementsLoading } = useListStatements();
  const { data: plans, isLoading: plansLoading } = useListPaymentPlans();
  const createPlan = useCreatePaymentPlan();
  const [showCreate, setShowCreate] = useState(false);
  const { register, handleSubmit, reset } = useForm<PlanForm>();

  const onSubmit = (data: PlanForm) => {
    createPlan.mutate({ data }, {
      onSuccess: () => {
        toast({ title: "Payment plan created" });
        queryClient.invalidateQueries({ queryKey: getListPaymentPlansQueryKey() });
        setShowCreate(false);
        reset();
      },
      onError: () => toast({ title: "Failed to create plan", variant: "destructive" }),
    });
  };

  const totalOutstanding = (statements ?? []).reduce((s, st) => s + Number(st.balance), 0);

  return (
    <div>
      <PageHeader
        title="Patient Billing"
        subtitle={`${formatCurrency(totalOutstanding)} total outstanding balance`}
        actions={
          <Button onClick={() => setShowCreate(true)} data-testid="button-create-plan">
            <Plus className="w-4 h-4 mr-1.5" /> Payment Plan
          </Button>
        }
      />

      <Tabs defaultValue="statements">
        <TabsList className="mb-4">
          <TabsTrigger value="statements"><Receipt className="w-3.5 h-3.5 mr-1.5" />Statements</TabsTrigger>
          <TabsTrigger value="plans"><CreditCard className="w-3.5 h-3.5 mr-1.5" />Payment Plans</TabsTrigger>
        </TabsList>

        <TabsContent value="statements">
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/30">
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">Patient</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">Statement Date</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">Due Date</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">Total</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">Paid</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">Balance</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {statementsLoading ? Array.from({ length: 4 }).map((_, i) => (
                      <tr key={i} className="border-b border-border">{Array.from({ length: 7 }).map((_, j) => <td key={j} className="px-4 py-3"><Skeleton className="h-4 w-full" /></td>)}</tr>
                    )) : (statements ?? []).map(st => (
                      <tr key={st.id} className="border-b border-border hover:bg-muted/20 transition-colors" data-testid={`row-statement-${st.id}`}>
                        <td className="px-4 py-3 font-medium">{st.patientName}</td>
                        <td className="px-4 py-3 text-muted-foreground">{formatDate(st.statementDate)}</td>
                        <td className="px-4 py-3 text-muted-foreground">{formatDate(st.dueDate)}</td>
                        <td className="px-4 py-3">{formatCurrency(st.totalAmount)}</td>
                        <td className="px-4 py-3">{formatCurrency(st.paidAmount)}</td>
                        <td className="px-4 py-3 font-semibold">{formatCurrency(st.balance)}</td>
                        <td className="px-4 py-3"><StatusBadge status={st.status} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="plans">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {plansLoading ? Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-40" />) :
              (plans ?? []).map(plan => {
                const progress = ((plan.installmentsPaid / plan.totalInstallments) * 100);
                return (
                  <Card key={plan.id} className="p-4" data-testid={`card-plan-${plan.id}`}>
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="font-semibold text-sm">{plan.patientName}</p>
                        <p className="text-xs text-muted-foreground">Started {formatDate(plan.startDate)}</p>
                      </div>
                      <StatusBadge status={plan.status} />
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Monthly</span>
                        <span className="font-medium">{formatCurrency(plan.monthlyAmount)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Remaining</span>
                        <span className="font-semibold">{formatCurrency(plan.remainingBalance)}</span>
                      </div>
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-muted-foreground">Progress</span>
                          <span>{plan.installmentsPaid}/{plan.totalInstallments}</span>
                        </div>
                        <Progress value={progress} className="h-1.5" />
                      </div>
                    </div>
                  </Card>
                );
              })
            }
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Create Payment Plan</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-3 py-3">
              <div><Label>Patient ID</Label><Input type="number" {...register("patientId", { required: true, valueAsNumber: true })} /></div>
              <div><Label>Total Amount ($)</Label><Input type="number" step="0.01" {...register("totalAmount", { required: true, valueAsNumber: true })} /></div>
              <div><Label>Monthly Amount ($)</Label><Input type="number" step="0.01" {...register("monthlyAmount", { required: true, valueAsNumber: true })} /></div>
              <div><Label>Start Date</Label><Input type="date" {...register("startDate", { required: true })} /></div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
              <Button type="submit" disabled={createPlan.isPending}>{createPlan.isPending ? "Creating..." : "Create Plan"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
