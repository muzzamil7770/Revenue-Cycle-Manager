import { useListPayers, useCreatePayer, getListPayersQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { formatPercent } from "@/lib/utils";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Plus } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";

interface PayerForm {
  name: string;
  type: string;
  npi: string;
  claimsAddress: string;
  phone: string;
  electronicPayerId: string;
}

export default function Insurance() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: payers, isLoading } = useListPayers();
  const createPayer = useCreatePayer();
  const [showCreate, setShowCreate] = useState(false);
  const { register, handleSubmit, reset, setValue } = useForm<PayerForm>();

  const onSubmit = (data: PayerForm) => {
    createPayer.mutate({ data }, {
      onSuccess: () => {
        toast({ title: "Payer added successfully" });
        queryClient.invalidateQueries({ queryKey: getListPayersQueryKey() });
        setShowCreate(false);
        reset();
      },
      onError: () => toast({ title: "Failed to add payer", variant: "destructive" }),
    });
  };

  return (
    <div>
      <PageHeader
        title="Insurance & Payers"
        subtitle={`${(payers ?? []).length} payers configured`}
        actions={
          <Button onClick={() => setShowCreate(true)} data-testid="button-add-payer">
            <Plus className="w-4 h-4 mr-1.5" />
            Add Payer
          </Button>
        }
      />

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Payer Name</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Type</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Electronic ID</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Avg Reimb Days</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Denial Rate</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Contracted Rate</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Phone</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <tr key={i} className="border-b border-border">
                      {Array.from({ length: 8 }).map((_, j) => (
                        <td key={j} className="px-4 py-3"><Skeleton className="h-4 w-full" /></td>
                      ))}
                    </tr>
                  ))
                ) : (payers ?? []).map(payer => (
                  <tr key={payer.id} className="border-b border-border hover:bg-muted/20 transition-colors" data-testid={`row-payer-${payer.id}`}>
                    <td className="px-4 py-3">
                      <p className="font-medium">{payer.name}</p>
                      <p className="text-xs text-muted-foreground font-mono">{payer.npi}</p>
                    </td>
                    <td className="px-4 py-3"><StatusBadge status={payer.type.toLowerCase()} /></td>
                    <td className="px-4 py-3 font-mono text-xs">{payer.electronicPayerId}</td>
                    <td className="px-4 py-3">{payer.avgReimbursementDays ? `${Number(payer.avgReimbursementDays).toFixed(1)} days` : "—"}</td>
                    <td className="px-4 py-3">
                      <span className={Number(payer.denialRate) > 15 ? "text-destructive font-medium" : ""}>
                        {payer.denialRate ? formatPercent(payer.denialRate) : "—"}
                      </span>
                    </td>
                    <td className="px-4 py-3">{payer.contractedRate ? `${formatPercent(payer.contractedRate)} of billed` : "—"}</td>
                    <td className="px-4 py-3 text-muted-foreground">{payer.phone}</td>
                    <td className="px-4 py-3"><StatusBadge status={payer.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Add Payer</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-3 py-3">
              <div><Label>Payer Name</Label><Input {...register("name", { required: true })} /></div>
              <div>
                <Label>Type</Label>
                <Select onValueChange={(v) => setValue("type", v)}>
                  <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Commercial">Commercial</SelectItem>
                    <SelectItem value="Government">Government</SelectItem>
                    <SelectItem value="Managed Care">Managed Care</SelectItem>
                    <SelectItem value="Self-Pay">Self-Pay</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div><Label>NPI</Label><Input {...register("npi", { required: true })} /></div>
              <div><Label>Electronic Payer ID</Label><Input {...register("electronicPayerId", { required: true })} /></div>
              <div><Label>Phone</Label><Input {...register("phone")} /></div>
              <div><Label>Claims Address</Label><Input {...register("claimsAddress")} /></div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
              <Button type="submit" disabled={createPayer.isPending}>
                {createPayer.isPending ? "Saving..." : "Add Payer"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
