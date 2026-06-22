import { useState } from "react";
import { useListUsers, useCreateUser, useDeleteUser, getListUsersQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { formatDate } from "@/lib/utils";
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
import { Plus, Trash2, Users } from "lucide-react";
import { useForm } from "react-hook-form";

const ROLES = ["System Administrator", "Billing Manager", "AR Specialist", "Payment Poster", "Medical Coder", "Patient Access", "Physician", "Viewer"];
const DEPARTMENTS = ["Billing", "AR", "Coding", "Front Desk", "Internal Medicine", "Cardiology", "IT", "Finance"];

interface UserForm { name: string; email: string; role: string; department: string; }

export default function Admin() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: users, isLoading } = useListUsers();
  const createUser = useCreateUser();
  const deleteUser = useDeleteUser();
  const [showCreate, setShowCreate] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const { register, handleSubmit, reset, setValue } = useForm<UserForm>();

  const onSubmit = (data: UserForm) => {
    createUser.mutate({ data }, {
      onSuccess: () => {
        toast({ title: "User created successfully" });
        queryClient.invalidateQueries({ queryKey: getListUsersQueryKey() });
        setShowCreate(false);
        reset();
      },
      onError: () => toast({ title: "Failed to create user", variant: "destructive" }),
    });
  };

  const confirmDelete = () => {
    if (!deleteId) return;
    deleteUser.mutate({ id: deleteId }, {
      onSuccess: () => {
        toast({ title: "User removed" });
        queryClient.invalidateQueries({ queryKey: getListUsersQueryKey() });
        setDeleteId(null);
      },
      onError: () => toast({ title: "Failed to remove user", variant: "destructive" }),
    });
  };

  return (
    <div>
      <PageHeader
        title="Admin Panel"
        subtitle={`${(users ?? []).length} system users`}
        actions={
          <Button onClick={() => setShowCreate(true)} data-testid="button-create-user">
            <Plus className="w-4 h-4 mr-1.5" /> Add User
          </Button>
        }
      />

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">User</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Role</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Department</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Last Login</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Permissions</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {isLoading ? Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i} className="border-b border-border">{Array.from({ length: 7 }).map((_, j) => <td key={j} className="px-4 py-3"><Skeleton className="h-4 w-full" /></td>)}</tr>
                )) : (users ?? []).map(user => {
                  const permissions = Array.isArray(user.permissions) ? user.permissions : [];
                  return (
                    <tr key={user.id} className="border-b border-border hover:bg-muted/20 transition-colors" data-testid={`row-user-${user.id}`}>
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium">{user.name}</p>
                          <p className="text-xs text-muted-foreground">{user.email}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3">{user.role}</td>
                      <td className="px-4 py-3 text-muted-foreground">{user.department}</td>
                      <td className="px-4 py-3 text-muted-foreground">{formatDate(user.lastLogin)}</td>
                      <td className="px-4 py-3"><StatusBadge status={user.status} /></td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {permissions.slice(0, 3).map((p) => (
                            <span key={p} className="px-1.5 py-0.5 bg-muted rounded text-xs">{p}</span>
                          ))}
                          {permissions.length > 3 && (
                            <span className="px-1.5 py-0.5 bg-muted rounded text-xs text-muted-foreground">+{permissions.length - 3}</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => setDeleteId(user.id)}
                          className="p-1.5 rounded text-muted-foreground hover:text-destructive hover:bg-muted transition-colors"
                          data-testid={`button-delete-user-${user.id}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Add System User</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-3 py-3">
              <div><Label>Full Name</Label><Input {...register("name", { required: true })} data-testid="input-user-name" /></div>
              <div><Label>Email</Label><Input type="email" {...register("email", { required: true })} data-testid="input-user-email" /></div>
              <div>
                <Label>Role</Label>
                <Select onValueChange={v => setValue("role", v)}>
                  <SelectTrigger><SelectValue placeholder="Select role" /></SelectTrigger>
                  <SelectContent>{ROLES.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label>Department</Label>
                <Select onValueChange={v => setValue("department", v)}>
                  <SelectTrigger><SelectValue placeholder="Select department" /></SelectTrigger>
                  <SelectContent>{DEPARTMENTS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
              <Button type="submit" disabled={createUser.isPending}>{createUser.isPending ? "Creating..." : "Add User"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Remove User</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground py-2">Are you sure you want to remove this user? This action cannot be undone.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
            <Button variant="destructive" onClick={confirmDelete} disabled={deleteUser.isPending}>
              {deleteUser.isPending ? "Removing..." : "Remove User"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
