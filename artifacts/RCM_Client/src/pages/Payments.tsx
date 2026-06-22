import { useState } from "react";
import { useListPayments, useGetPaymentSummary, useCreatePayment, getListPaymentsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { formatCurrency, formatDate } from "@/lib/utils";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { KpiCard } from "@/components/shared/KpiCard";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Plus, DollarSign, TrendingUp, Clock, CreditCard } from "lucide-react";
import { useForm } from "react-hook-form";

interface PaymentForm {
  claimId: number;
  amount: number;
  paymentDate: string;
  type: string;
  method: string;
  checkNumber: string;
  adjustments: number;
}

export default function Payments() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: payments, isLoading } = useListPayments();
  const { data: summary, isLoading: summaryLoading } = useGetPaymentSummary();
  const createPayment = useCreatePayment();
  const [showCreate, setShowCreate] = useState(false);
  const { register, handleSubmit, reset, setValue } = useForm<PaymentForm>();

  const onSubmit = (data: PaymentForm) => {
    createPayment.mutate({ data: { ...data, checkNumber: data.checkNumber || null } }, {
      onSuccess: () => {
        toast({ title: "Payment posted successfully" });
        queryClient.invalidateQueries({ queryKey: getListPaymentsQueryKey() });
        setShowCreate(false);
        reset();
      },
      onError: () => toast({ title: "Failed to post payment", variant: "destructive" }),
    });
  };

  return (
    <div>
      <PageHeader
        title="Payment Posting"
        subtitle="Insurance and patient payment management"
        actions={
          <Button onClick={() => setShowCreate(true)} data-testid="button-post-payment">
            <Plus className="w-4 h-4 mr-1.5" />
            Post Payment
          </Button>
        }
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <KpiCard title="Total Collected" value={formatCurrency(summary?.totalCollected)} icon={DollarSign} variant="success" isLoading={summaryLoading} />
        <KpiCard title="Insurance Payments" value={formatCurrency(summary?.insurancePayments)} icon={CreditCard} variant="primary" isLoading={summaryLoading} />
        <KpiCard title="Patient Payments" value={formatCurrency(summary?.patientPayments)} icon={DollarSign} variant="default" isLoading={summaryLoading} />
        <KpiCard title="Collection Rate" value={`${Number(summary?.collectionRate ?? 0).toFixed(1)}%`} icon={TrendingUp} variant="success" isLoading={summaryLoading} />
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
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Date</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Amount</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Type</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Method</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Check/ERA #</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Posted By</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <tr key={i} className="border-b border-border">
                      {Array.from({ length: 10 }).map((_, j) => (
                        <td key={j} className="px-4 py-3"><Skeleton className="h-4 w-full" /></td>
                      ))}
                    </tr>
                  ))
                ) : (payments ?? []).map(payment => (
                  <tr key={payment.id} className="border-b border-border hover:bg-muted/20 transition-colors" data-testid={`row-payment-${payment.id}`}>
                    <td className="px-4 py-3 font-mono text-xs">{payment.claimNumber}</td>
                    <td className="px-4 py-3 font-medium">{payment.patientName}</td>
                    <td className="px-4 py-3 text-muted-foreground">{payment.payerName}</td>
                    <td className="px-4 py-3 text-muted-foreground">{formatDate(payment.paymentDate)}</td>
                    <td className="px-4 py-3 font-semibold text-emerald-700 dark:text-emerald-400">{formatCurrency(payment.amount)}</td>
                    <td className="px-4 py-3 capitalize">{payment.type}</td>
                    <td className="px-4 py-3 uppercase text-xs">{payment.method}</td>
                    <td className="px-4 py-3 font-mono text-xs">{payment.checkNumber ?? payment.eraNumber ?? "—"}</td>
                    <td className="px-4 py-3"><StatusBadge status={payment.status} /></td>
                    <td className="px-4 py-3 text-muted-foreground">{payment.postedBy}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Post Payment</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-3 py-3">
              <div><Label>Claim ID</Label><Input type="number" {...register("claimId", { required: true, valueAsNumber: true })} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Amount</Label><Input type="number" step="0.01" {...register("amount", { required: true, valueAsNumber: true })} /></div>
                <div><Label>Adjustments</Label><Input type="number" step="0.01" {...register("adjustments", { valueAsNumber: true, value: 0 })} /></div>
              </div>
              <div><Label>Payment Date</Label><Input type="date" {...register("paymentDate", { required: true })} /></div>
              <div>
                <Label>Type</Label>
                <Select onValueChange={(v) => setValue("type", v)}>
                  <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="insurance">Insurance</SelectItem>
                    <SelectItem value="patient">Patient</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Method</Label>
                <Select onValueChange={(v) => setValue("method", v)}>
                  <SelectTrigger><SelectValue placeholder="Select method" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="eft">EFT</SelectItem>
                    <SelectItem value="check">Check</SelectItem>
                    <SelectItem value="credit_card">Credit Card</SelectItem>
                    <SelectItem value="cash">Cash</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Check / ERA Number</Label><Input {...register("checkNumber")} placeholder="Optional" /></div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
              <Button type="submit" disabled={createPayment.isPending}>
                {createPayment.isPending ? "Posting..." : "Post Payment"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
