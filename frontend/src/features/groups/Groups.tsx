import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import {
  Users,
  Plus,
  MoreHorizontal,
  Search,
  Filter,
  X,
  ChevronDown,
  Zap,
  Folder,
  Trash2,
  Edit,
} from "lucide-react";
import { api, type ContactGroup, type GroupRule } from "@/api";
import { PageHeader, EmptyState, ErrorState, ListSkeleton } from "@/components/shared";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type GroupType = "static" | "dynamic";

/** View model: API group + UI-friendly `type` alias for `kind`. */
type Group = Omit<ContactGroup, "kind"> & { type: GroupType };

interface Rule {
  id: string;
  field: string;
  operator: GroupRule["operator"];
  value: string;
  logic: "AND" | "OR";
}

const FIELDS = [
  { value: "city", label: "City" },
  { value: "tags", label: "Tags" },
  { value: "optedIn", label: "Opt-in status" },
  { value: "lifetimeValue", label: "Lifetime value" },
  { value: "lastSeen", label: "Last seen" },
];

const OPERATORS = [
  { value: "equals", label: "Equals" },
  { value: "not_equals", label: "Does not equal" },
  { value: "contains", label: "Contains" },
  { value: "not_contains", label: "Does not contain" },
  { value: "greater_than", label: "Greater than" },
  { value: "less_than", label: "Less than" },
  { value: "is_empty", label: "Is empty" },
  { value: "is_not_empty", label: "Is not empty" },
];

export function Groups() {
  const { t } = useTranslation();
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"static" | "dynamic">("static");
  const [createOpen, setCreateOpen] = useState(false);
  const [createType, setCreateType] = useState<GroupType>("static");
  const [editing, setEditing] = useState<Group | null>(null);
  const [membersGroup, setMembersGroup] = useState<Group | null>(null);
  const qc = useQueryClient();

  const q = useQuery({
    queryKey: ["groups"],
    queryFn: () => api.groups.list(),
  });

  const groups: Group[] = (q.data ?? []).map((g) => ({ ...g, type: g.kind }));

  const deleteGroup = useMutation({
    mutationFn: (id: string) => api.groups.remove(id),
    onSuccess: () => {
      toast.success("Group deleted");
      qc.invalidateQueries({ queryKey: ["groups"] });
    },
    onError: () => toast.error("Couldn't delete group"),
  });

  const filteredGroups = groups.filter((g) => {
    const matchesTab = g.type === activeTab;
    const matchesSearch = g.name.toLowerCase().includes(search.toLowerCase());
    return matchesTab && matchesSearch;
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Groups"
        description="Organize contacts into static lists or dynamic segments."
        actions={
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button>
                <Plus className="size-4 mr-2" />
                Create group
                <ChevronDown className="ml-2 size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => {
                  setCreateType("static");
                  setCreateOpen(true);
                }}
              >
                <Folder className="mr-2 size-4" />
                Static group
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  setCreateType("dynamic");
                  setCreateOpen(true);
                }}
              >
                <Zap className="mr-2 size-4" />
                Dynamic segment
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        }
      />

      <Card className="p-4">
        {/* Tabs and Search */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-2">
            <Button
              variant={activeTab === "static" ? "default" : "ghost"}
              onClick={() => setActiveTab("static")}
            >
              <Folder className="size-4 mr-2" />
              Static
              <Badge variant="secondary" className="ml-2">
                {groups.filter((g) => g.type === "static").length}
              </Badge>
            </Button>
            <Button
              variant={activeTab === "dynamic" ? "default" : "ghost"}
              onClick={() => setActiveTab("dynamic")}
            >
              <Zap className="size-4 mr-2" />
              Dynamic
              <Badge variant="secondary" className="ml-2">
                {groups.filter((g) => g.type === "dynamic").length}
              </Badge>
            </Button>
          </div>
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search groups..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {/* Table */}
        {q.isPending ? (
          <ListSkeleton rows={4} />
        ) : q.isError ? (
          <ErrorState onRetry={() => q.refetch()} />
        ) : filteredGroups.length === 0 ? (
          <EmptyState
            icon={activeTab === "static" ? Folder : Zap}
            title={`No ${activeTab} groups yet`}
            description={`Create your first ${activeTab} group to organize your contacts.`}
            action={
              <Button
                onClick={() => {
                  setCreateType(activeTab);
                  setCreateOpen(true);
                }}
              >
                <Plus className="size-4 mr-2" />
                Create {activeTab} group
              </Button>
            }
          />
        ) : (
          <div className="mt-4 overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Members</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="w-12" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredGroups.map((group) => (
                  <TableRow key={group.id}>
                    <TableCell className="font-medium">{group.name}</TableCell>
                    <TableCell>
                      <Badge variant={group.type === "dynamic" ? "default" : "secondary"}>
                        {group.type === "dynamic" ? (
                          <>
                            <Zap className="mr-1 size-3" />
                            Dynamic
                          </>
                        ) : (
                          <>
                            <Folder className="mr-1 size-3" />
                            Static
                          </>
                        )}
                      </Badge>
                    </TableCell>
                    <TableCell className="tabular">{group.memberCount}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(group.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="size-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setMembersGroup(group)}>
                            <Users className="mr-2 size-4" />
                            View members
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              setEditing(group);
                              setCreateType(group.type);
                              setCreateOpen(true);
                            }}
                          >
                            <Edit className="mr-2 size-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => deleteGroup.mutate(group.id)}
                          >
                            <Trash2 className="mr-2 size-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>

      {/* Create/Edit Dialog */}
      <CreateGroupDialog
        open={createOpen}
        onOpenChange={(o) => {
          setCreateOpen(o);
          if (!o) setEditing(null);
        }}
        type={createType}
        group={editing}
      />

      {/* Members Dialog */}
      <MembersDialog group={membersGroup} onOpenChange={(o) => !o && setMembersGroup(null)} />
    </div>
  );
}

function MembersDialog({
  group,
  onOpenChange,
}: {
  group: Group | null;
  onOpenChange: (open: boolean) => void;
}) {
  const detail = useQuery({
    queryKey: ["group", group?.id],
    queryFn: () => api.groups.get(group!.id),
    enabled: !!group,
  });

  return (
    <Dialog open={!!group} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{group?.name}</DialogTitle>
          <DialogDescription>{detail.data?.memberCount ?? 0} members</DialogDescription>
        </DialogHeader>
        {detail.isPending ? (
          <ListSkeleton rows={5} />
        ) : detail.isError ? (
          <ErrorState onRetry={() => detail.refetch()} />
        ) : (
          <div className="space-y-2">
            {(detail.data?.members ?? []).map((m) => (
              <div
                key={m.id}
                className="flex items-center justify-between rounded-md border px-3 py-2 text-sm"
              >
                <div>
                  <p className="font-medium">{m.name || m.phone}</p>
                  <p className="text-muted-foreground">{m.phone}</p>
                </div>
                <div className="flex gap-1">
                  {m.tags.slice(0, 2).map((t) => (
                    <Badge key={t} variant="secondary" className="text-xs">
                      {t}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
            {(detail.data?.members.length ?? 0) === 0 && (
              <p className="py-6 text-center text-sm text-muted-foreground">No members yet</p>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function CreateGroupDialog({
  open,
  onOpenChange,
  type,
  group,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: GroupType;
  group?: Group | null;
}) {
  const qc = useQueryClient();
  const [name, setName] = useState("");
  const [rules, setRules] = useState<Rule[]>([
    { id: "r1", field: "city", operator: "equals", value: "", logic: "AND" },
  ]);

  // Prefill when editing
  useEffect(() => {
    if (open && group) {
      setName(group.name);
      setRules(
        (group.rules ?? []).map((r, i) => ({
          id: `r${i + 1}`,
          field: r.field,
          operator: r.operator,
          value: r.value,
          logic: r.logic ?? "AND",
        })),
      );
      if ((group.rules ?? []).length === 0) {
        setRules([{ id: "r1", field: "city", operator: "equals", value: "", logic: "AND" }]);
      }
    } else if (open) {
      setName("");
      setRules([{ id: "r1", field: "city", operator: "equals", value: "", logic: "AND" }]);
    }
  }, [open, group]);

  const addRule = () => {
    setRules([
      ...rules,
      {
        id: `r${rules.length + 1}`,
        field: "city",
        operator: "equals",
        value: "",
        logic: "AND",
      },
    ]);
  };

  const removeRule = (id: string) => {
    setRules(rules.filter((r) => r.id !== id));
  };

  const updateRule = (id: string, updates: Partial<Rule>) => {
    setRules(rules.map((r) => (r.id === id ? { ...r, ...updates } : r)));
  };

  const save = useMutation({
    mutationFn: async () => {
      const payload = {
        name,
        kind: type,
        ...(type === "dynamic"
          ? {
              rules: rules.map(({ field, operator, value, logic }) => ({
                field,
                operator,
                value,
                logic,
              })),
            }
          : {}),
      };
      if (group) {
        return api.groups.update(group.id, payload);
      }
      return api.groups.create(payload);
    },
    onSuccess: () => {
      toast.success(
        group ? "Group updated" : `${type === "dynamic" ? "Segment" : "Group"} created`,
      );
      qc.invalidateQueries({ queryKey: ["groups"] });
      onOpenChange(false);
    },
    onError: () => toast.error("Couldn't save group"),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {group ? "Edit" : "Create"} {type === "dynamic" ? "dynamic segment" : "static group"}
          </DialogTitle>
          <DialogDescription>
            {type === "dynamic"
              ? "Define rules to automatically include contacts that match your criteria."
              : "Manually add contacts to this group."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Group name</Label>
            <Input
              id="name"
              placeholder="e.g., VIP Customers"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          {type === "dynamic" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium">Rules</h3>
              </div>

              <div className="space-y-3">
                {rules.map((rule, index) => (
                  <div key={rule.id} className="flex items-start gap-2 rounded-lg border p-3">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        {index > 0 && (
                          <Select
                            value={rule.logic}
                            onValueChange={(v: "AND" | "OR") => updateRule(rule.id, { logic: v })}
                          >
                            <SelectTrigger className="w-20">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="AND">AND</SelectItem>
                              <SelectItem value="OR">OR</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                        <Select
                          value={rule.field}
                          onValueChange={(v) => updateRule(rule.id, { field: v })}
                        >
                          <SelectTrigger className="flex-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {FIELDS.map((f) => (
                              <SelectItem key={f.value} value={f.value}>
                                {f.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Select
                          value={rule.operator}
                          onValueChange={(v) =>
                            updateRule(rule.id, { operator: v as Rule["operator"] })
                          }
                        >
                          <SelectTrigger className="flex-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {OPERATORS.map((op) => (
                              <SelectItem key={op.value} value={op.value}>
                                {op.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <Input
                        placeholder="Value"
                        value={rule.value}
                        onChange={(e) => updateRule(rule.id, { value: e.target.value })}
                      />
                    </div>
                    {rules.length > 1 && (
                      <Button variant="ghost" size="sm" onClick={() => removeRule(rule.id)}>
                        <X className="size-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>

              <Button variant="outline" size="sm" onClick={addRule} className="w-full">
                <Plus className="mr-2 size-4" />
                Add rule
              </Button>
            </div>
          )}

          {type === "static" && (
            <div className="space-y-2">
              <Label>Members</Label>
              <div className="rounded-md border p-8 text-center">
                <Users className="size-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground mb-4">Add contacts to this group</p>
                <Button variant="outline" size="sm">
                  <Plus className="mr-2 size-4" />
                  Add contacts
                </Button>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={() => save.mutate()}
            loading={save.isPending}
            disabled={!name || (type === "dynamic" && rules.some((r) => !r.value))}
          >
            {group ? "Save changes" : `Create ${type === "dynamic" ? "segment" : "group"}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
