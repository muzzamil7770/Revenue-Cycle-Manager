import { useState } from "react";
import { useListCharges, useCreateCharge, getListChargesQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { formatCurrency, formatDate } from "@/lib/utils";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Plus } from "lucide-react";
import { useForm } from "react-hook-form";

interface ChargeForm { patientId: number; serviceDate: string; cptCode: string; icdCode: string; description: string; amount: number; providerId: number; units: number; }

export default function Charges() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: charges, isLoading } = useListCharges();
  const createCharge = useCreateCharge();
  const [showCreate, setShowCreate] = useState(false);
  const { register, handleSubmit, reset } = useForm<ChargeForm>();

  const onSubmit = (data: ChargeForm) => {
    createCharge.mutate({ data }, {
      onSuccess: () => {
        toast({ title: "Charge entered successfully" });
        queryClient.invalidateQueries({ queryKey: getListChargesQueryKey() });
        setShowCreate(false);
        reset();
      },
      onError: () => toast({ title: "Failed to create charge", variant: "destructive" }),
    });
  };

  const totalBilled = (charges ?? []).reduce((sum, c) => sum + Number(c.amount), 0);

  return (
    <div>
      <PageHeader
        title="Charge Capture"
        subtitle={`${(charges ?? []).length} charges · ${formatCurrency(totalBilled)} total billed`}
        actions={
          <Button onClick={() => setShowCreate(true)} data-testid="button-add-charge">
            <Plus className="w-4 h-4 mr-1.5" /> Add Charge
          </Button>
        }
      />
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Patient</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Service Date</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">CPT</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">ICD-10</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Description</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Units</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Amount</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Provider</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i} className="border-b border-border">{Array.from({ length: 9 }).map((_, j) => <td key={j} className="px-4 py-3"><Skeleton className="h-4 w-full" /></td>)}</tr>
                )) : (charges ?? []).map(charge => (
                  <tr key={charge.id} className="border-b border-border hover:bg-muted/20 transition-colors" data-testid={`row-charge-${charge.id}`}>
                    <td className="px-4 py-3 font-medium">{charge.patientName}</td>
                    <td className="px-4 py-3 text-muted-foreground">{formatDate(charge.serviceDate)}</td>
                    <td className="px-4 py-3 font-mono text-xs">{charge.cptCode}</td>
                    <td className="px-4 py-3 font-mono text-xs">{charge.icdCode}</td>
                    <td className="px-4 py-3 text-muted-foreground max-w-48 truncate">{charge.description || "—"}</td>
                    <td className="px-4 py-3">{charge.units}</td>
                    <td className="px-4 py-3 font-semibold">{formatCurrency(charge.amount)}</td>
                    <td className="px-4 py-3 text-muted-foreground">{charge.providerName}</td>
                    <td className="px-4 py-3"><StatusBadge status={charge.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Enter Charge</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid grid-cols-2 gap-3 py-3">
              <div><Label>Patient ID</Label><Input type="number" {...register("patientId", { required: true, valueAsNumber: true })} /></div>
              <div><Label>Provider ID</Label><Input type="number" {...register("providerId", { required: true, valueAsNumber: true })} /></div>
              <div><Label>Service Date</Label><Input type="date" {...register("serviceDate", { required: true })} /></div>
              <div><Label>Units</Label><Input type="number" {...register("units", { valueAsNumber: true, value: 1 })} /></div>
              <div><Label>CPT Code</Label><Input {...register("cptCode", { required: true })} placeholder="e.g. 99214" /></div>
              <div><Label>ICD-10 Code</Label><Input {...register("icdCode", { required: true })} placeholder="e.g. I10" /></div>
              <div className="col-span-2"><Label>Description</Label><Input {...register("description")} /></div>
              <div><Label>Amount ($)</Label><Input type="number" step="0.01" {...register("amount", { required: true, valueAsNumber: true })} /></div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
              <Button type="submit" disabled={createCharge.isPending}>{createCharge.isPending ? "Saving..." : "Add Charge"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
