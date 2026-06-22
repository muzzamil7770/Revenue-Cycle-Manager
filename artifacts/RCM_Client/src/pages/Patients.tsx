import { useState } from "react";
import { Link } from "wouter";
import { useListPatients, useCreatePatient, getListPatientsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { formatCurrency, formatDate } from "@/lib/utils";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Search, Plus, ExternalLink, ChevronLeft, ChevronRight } from "lucide-react";
import { useForm } from "react-hook-form";

const INSURERS = ["Blue Cross Blue Shield", "Medicare", "Medicaid", "Aetna", "United Health", "Cigna", "Humana", "Kaiser", "Self-Pay"];
const PROVIDERS = ["Dr. Emily Carter", "Dr. Marcus Johnson", "Dr. Sarah Lee", "Dr. Robert Kim", "Dr. Angela Torres"];

interface PatientFormData {
  firstName: string;
  lastName: string;
  dob: string;
  primaryInsurance: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  provider: string;
}

export default function Patients() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [showCreate, setShowCreate] = useState(false);
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const limit = 10;

  const { data, isLoading } = useListPatients(
    { search: debouncedSearch || undefined, page, limit },
    { query: { queryKey: getListPatientsQueryKey({ search: debouncedSearch || undefined, page, limit }) } }
  );
  const createPatient = useCreatePatient();
  const { register, handleSubmit, reset, setValue, watch } = useForm<PatientFormData>();

  const handleSearchChange = (v: string) => {
    setSearch(v);
    clearTimeout((window as any)._searchTimer);
    (window as any)._searchTimer = setTimeout(() => { setDebouncedSearch(v); setPage(1); }, 400);
  };

  const onSubmit = (formData: PatientFormData) => {
    createPatient.mutate({ data: formData }, {
      onSuccess: () => {
        toast({ title: "Patient registered successfully" });
        queryClient.invalidateQueries({ queryKey: getListPatientsQueryKey() });
        setShowCreate(false);
        reset();
      },
      onError: () => toast({ title: "Failed to register patient", variant: "destructive" }),
    });
  };

  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / limit);

  return (
    <div>
      <PageHeader
        title="Patient Access"
        subtitle={`${total.toLocaleString()} patients registered`}
        actions={
          <Button onClick={() => setShowCreate(true)} data-testid="button-register-patient">
            <Plus className="w-4 h-4 mr-1.5" />
            Register Patient
          </Button>
        }
      />

      {/* Search */}
      <div className="flex gap-3 mb-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search patients..."
            value={search}
            onChange={e => handleSearchChange(e.target.value)}
            className="pl-8"
            data-testid="input-patient-search"
          />
        </div>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Patient</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">MRN</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">DOB</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Insurance</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Provider</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Balance</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="border-b border-border">
                      {Array.from({ length: 8 }).map((_, j) => (
                        <td key={j} className="px-4 py-3"><Skeleton className="h-4 w-full" /></td>
                      ))}
                    </tr>
                  ))
                ) : (data?.data ?? []).map(patient => (
                  <tr key={patient.id} className="border-b border-border hover:bg-muted/20 transition-colors" data-testid={`row-patient-${patient.id}`}>
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium">{patient.firstName} {patient.lastName}</p>
                        <p className="text-xs text-muted-foreground">{patient.email}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{patient.mrn}</td>
                    <td className="px-4 py-3 text-muted-foreground">{formatDate(patient.dob)}</td>
                    <td className="px-4 py-3">
                      <div>
                        <p>{patient.primaryInsurance}</p>
                        {patient.secondaryInsurance && <p className="text-xs text-muted-foreground">{patient.secondaryInsurance}</p>}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{patient.provider || "—"}</td>
                    <td className="px-4 py-3 font-medium">{formatCurrency(patient.balance)}</td>
                    <td className="px-4 py-3"><StatusBadge status={patient.status} /></td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/patients/${patient.id}`}
                        className="p-1.5 rounded hover:bg-muted transition-colors inline-flex"
                        data-testid={`link-patient-${patient.id}`}
                      >
                        <ExternalLink className="w-4 h-4 text-muted-foreground" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-border">
              <p className="text-sm text-muted-foreground">
                Showing {((page - 1) * limit) + 1}–{Math.min(page * limit, total)} of {total}
              </p>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <span className="text-sm px-2">{page} / {totalPages}</span>
                <Button variant="ghost" size="sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Patient Dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Register New Patient</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid grid-cols-2 gap-3 py-3">
              <div>
                <Label>First Name</Label>
                <Input {...register("firstName", { required: true })} data-testid="input-first-name" />
              </div>
              <div>
                <Label>Last Name</Label>
                <Input {...register("lastName", { required: true })} data-testid="input-last-name" />
              </div>
              <div>
                <Label>Date of Birth</Label>
                <Input type="date" {...register("dob", { required: true })} data-testid="input-dob" />
              </div>
              <div>
                <Label>Phone</Label>
                <Input {...register("phone", { required: true })} data-testid="input-phone" />
              </div>
              <div className="col-span-2">
                <Label>Email</Label>
                <Input type="email" {...register("email", { required: true })} data-testid="input-email" />
              </div>
              <div className="col-span-2">
                <Label>Primary Insurance</Label>
                <Select onValueChange={(v) => setValue("primaryInsurance", v)}>
                  <SelectTrigger data-testid="select-primary-insurance">
                    <SelectValue placeholder="Select insurer" />
                  </SelectTrigger>
                  <SelectContent>
                    {INSURERS.map(i => <SelectItem key={i} value={i}>{i}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Provider</Label>
                <Select onValueChange={(v) => setValue("provider", v)}>
                  <SelectTrigger data-testid="select-provider">
                    <SelectValue placeholder="Select provider" />
                  </SelectTrigger>
                  <SelectContent>
                    {PROVIDERS.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Address</Label>
                <Input {...register("address")} data-testid="input-address" />
              </div>
              <div>
                <Label>City</Label>
                <Input {...register("city")} data-testid="input-city" />
              </div>
              <div>
                <Label>State</Label>
                <Input {...register("state")} maxLength={2} data-testid="input-state" />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
              <Button type="submit" disabled={createPatient.isPending} data-testid="button-submit-patient">
                {createPatient.isPending ? "Saving..." : "Register Patient"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
