import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import {
  Users,
  Plus,
  MoreHorizontal,
  Search,
  Filter,
  X,
  Check,
  ChevronDown,
  Zap,
  Folder,
  Trash2,
  Edit,
  Play,
  Pause,
} from "lucide-react";
import { api } from "@/api";
import {
  PageHeader,
  EmptyState,
  ErrorState,
  ListSkeleton,
} from "@/components/shared";
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

interface Group {
  id: string;
  name: string;
  type: GroupType;
  memberCount: number;
  rules?: Rule[];
  active?: boolean;
  createdAt: string;
}

interface Rule {
  id: string;
  field: string;
  operator: string;
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

// Mock groups data
const MOCK_GROUPS: Group[] = [
  {
    id: "g1",
    name: "VIP Customers",
    type: "dynamic",
    memberCount: 12,
    rules: [
      {
        id: "r1",
        field: "lifetimeValue",
        operator: "greater_than",
        value: "10000",
        logic: "AND",
      },
      {
        id: "r2",
        field: "tags",
        operator: "contains",
        value: "VIP",
        logic: "AND",
      },
    ],
    active: true,
    createdAt: "2026-10-01T00:00:00Z",
  },
  {
    id: "g2",
    name: "Mumbai Region",
    type: "dynamic",
    memberCount: 18,
    rules: [
      {
        id: "r3",
        field: "city",
        operator: "equals",
        value: "Mumbai",
        logic: "AND",
      },
    ],
    active: true,
    createdAt: "2026-10-05T00:00:00Z",
  },
  {
    id: "g3",
    name: "Diwali Campaign List",
    type: "static",
    memberCount: 45,
    createdAt: "2026-10-15T00:00:00Z",
  },
  {
    id: "g4",
    name: "Inactive for 30 days",
    type: "dynamic",
    memberCount: 8,
    rules: [
      {
        id: "r4",
        field: "lastSeen",
        operator: "less_than",
        value: "30",
        logic: "AND",
      },
    ],
    active: false,
    createdAt: "2026-10-20T00:00:00Z",
  },
];

export function Groups() {
  const { t } = useTranslation();
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"static" | "dynamic">("static");
  const [createOpen, setCreateOpen] = useState(false);
  const [createType, setCreateType] = useState<GroupType>("static");

  const q = useQuery({
    queryKey: ["groups"],
    queryFn: async () => MOCK_GROUPS,
  });

  const filteredGroups =
    q.data?.filter((g) => {
      const matchesTab = g.type === activeTab;
      const matchesSearch = g.name.toLowerCase().includes(search.toLowerCase());
      return matchesTab && matchesSearch;
    }) ?? [];

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
                {MOCK_GROUPS.filter((g) => g.type === "static").length}
              </Badge>
            </Button>
            <Button
              variant={activeTab === "dynamic" ? "default" : "ghost"}
              onClick={() => setActiveTab("dynamic")}
            >
              <Zap className="size-4 mr-2" />
              Dynamic
              <Badge variant="secondary" className="ml-2">
                {MOCK_GROUPS.filter((g) => g.type === "dynamic").length}
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
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="w-12" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredGroups.map((group) => (
                  <TableRow key={group.id}>
                    <TableCell className="font-medium">{group.name}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          group.type === "dynamic" ? "default" : "secondary"
                        }
                      >
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
                    <TableCell className="tabular">
                      {group.memberCount}
                    </TableCell>
                    <TableCell>
                      {group.type === "dynamic" && (
                        <Badge variant={group.active ? "default" : "outline"}>
                          {group.active ? (
                            <>
                              <Check className="mr-1 size-3" />
                              Active
                            </>
                          ) : (
                            <>
                              <Pause className="mr-1 size-3" />
                              Paused
                            </>
                          )}
                        </Badge>
                      )}
                    </TableCell>
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
                          <DropdownMenuItem>
                            <Users className="mr-2 size-4" />
                            View members
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit className="mr-2 size-4" />
                            Edit
                          </DropdownMenuItem>
                          {group.type === "dynamic" && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem>
                                {group.active ? (
                                  <>
                                    <Pause className="mr-2 size-4" />
                                    Pause
                                  </>
                                ) : (
                                  <>
                                    <Play className="mr-2 size-4" />
                                    Activate
                                  </>
                                )}
                              </DropdownMenuItem>
                            </>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive">
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
        onOpenChange={setCreateOpen}
        type={createType}
      />
    </div>
  );
}

function CreateGroupDialog({
  open,
  onOpenChange,
  type,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: GroupType;
}) {
  const [name, setName] = useState("");
  const [rules, setRules] = useState<Rule[]>([
    { id: "r1", field: "city", operator: "equals", value: "", logic: "AND" },
  ]);
  const [matchCount, setMatchCount] = useState(0);

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

  // Simulate live match count
  const updateMatchCount = () => {
    // This would call the API to get real count
    const simulatedCount = Math.floor(Math.random() * 40) + 5;
    setMatchCount(simulatedCount);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Create {type === "dynamic" ? "dynamic segment" : "static group"}
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
                <Badge variant="outline">Matches {matchCount} contacts</Badge>
              </div>

              <div className="space-y-3">
                {rules.map((rule, index) => (
                  <div
                    key={rule.id}
                    className="flex items-start gap-2 rounded-lg border p-3"
                  >
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        {index > 0 && (
                          <Select
                            value={rule.logic}
                            onValueChange={(v: "AND" | "OR") =>
                              updateRule(rule.id, { logic: v })
                            }
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
                          onValueChange={(v) =>
                            updateRule(rule.id, { field: v })
                          }
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
                            updateRule(rule.id, { operator: v })
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
                        onChange={(e) => {
                          updateRule(rule.id, { value: e.target.value });
                          updateMatchCount();
                        }}
                      />
                    </div>
                    {rules.length > 1 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeRule(rule.id)}
                      >
                        <X className="size-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={addRule}
                className="w-full"
              >
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
                <p className="text-sm text-muted-foreground mb-4">
                  Add contacts to this group
                </p>
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
            onClick={() => {
              toast.success(
                `${type === "dynamic" ? "Segment" : "Group"} created successfully`,
              );
              onOpenChange(false);
            }}
            disabled={
              !name || (type === "dynamic" && rules.some((r) => !r.value))
            }
          >
            Create {type === "dynamic" ? "segment" : "group"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
