import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import {
  Users,
  Plus,
  Upload,
  Download,
  MoreHorizontal,
  Search,
  Filter,
  X,
  Check,
  Tag,
  LogOut,
  ChevronDown,
  Eye,
  Phone,
  Mail,
  MapPin,
  MessageSquare,
  FileText,
} from "lucide-react";
import { api, type Contact, type CreateContactInput, type ImportPreview } from "@/api";
import {
  PageHeader,
  EmptyState,
  ErrorState,
  ListSkeleton,
  PresenceAvatar,
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
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { formatNumber, timeAgo, initials } from "@/lib/format";
import { format } from "date-fns";

type ColumnKey =
  | "name"
  | "phone"
  | "email"
  | "city"
  | "tags"
  | "optedIn"
  | "lifetimeValue"
  | "lastSeen"
  | "createdAt";

interface Column {
  key: ColumnKey;
  label: string;
  visible: boolean;
}

const DEFAULT_COLUMNS: Column[] = [
  { key: "name", label: "Name", visible: true },
  { key: "phone", label: "Phone", visible: true },
  { key: "email", label: "Email", visible: true },
  { key: "city", label: "City", visible: true },
  { key: "tags", label: "Tags", visible: true },
  { key: "optedIn", label: "Opt-in", visible: true },
  { key: "lifetimeValue", label: "Lifetime Value", visible: false },
  { key: "lastSeen", label: "Last Seen", visible: true },
  { key: "createdAt", label: "Created", visible: false },
];

const SAVED_VIEWS = [
  { id: "all", name: "All contacts" },
  { id: "opted-in", name: "Opted in" },
  { id: "vip", name: "VIP customers" },
  { id: "cold", name: "Cold leads" },
];

export function Contacts() {
  const { t } = useTranslation();
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [tagFilter, setTagFilter] = useState<string>("all");
  const [sourceFilter, setSourceFilter] = useState<string>("all");
  const [optedFilter, setOptedFilter] = useState<string>("all");
  const [groupFilter, setGroupFilter] = useState<string>("all");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [columns, setColumns] = useState<Column[]>(DEFAULT_COLUMNS);
  const [selectedView, setSelectedView] = useState("all");
  const [columnChooserOpen, setColumnChooserOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [bulkTagOpen, setBulkTagOpen] = useState(false);
  const [bulkGroupOpen, setBulkGroupOpen] = useState(false);
  const [bulkTagIds, setBulkTagIds] = useState<string[]>([]);
  const [bulkGroupIds, setBulkGroupIds] = useState<string[]>([]);

  const filters = {
    search: search || undefined,
    tag: tagFilter === "all" ? undefined : tagFilter,
    source: sourceFilter === "all" ? undefined : sourceFilter,
    optedOut: optedFilter === "all" ? undefined : optedFilter === "opted-out",
    groupId: groupFilter === "all" ? undefined : groupFilter,
  };

  const q = useQuery({
    queryKey: ["contacts", { ...filters, page }],
    queryFn: () => api.contacts.list({ ...filters, page, pageSize: 25 }),
  });

  const tagsQuery = useQuery({ queryKey: ["tags"], queryFn: () => api.tags.list() });
  const groupsQuery = useQuery({ queryKey: ["groups"], queryFn: () => api.groups.list() });
  const sourcesQuery = useQuery({
    queryKey: ["contact-sources"],
    queryFn: async () => {
      const page1 = await api.contacts.list({ pageSize: 200 });
      return [...new Set(page1.items.map((c) => c.source).filter((s): s is string => !!s))];
    },
  });

  const invalidateContacts = () => {
    qc.invalidateQueries({ queryKey: ["contacts"] });
    qc.invalidateQueries({ queryKey: ["groups"] });
    qc.invalidateQueries({ queryKey: ["tags"] });
  };

  const bulkMutation = useMutation({
    mutationFn: (input: Parameters<typeof api.contacts.bulk>[0]) => api.contacts.bulk(input),
    onSuccess: (_r, input) => {
      const msgs: Record<string, string> = {
        addTags: "Tags added",
        removeTags: "Tags removed",
        setOptedOut: "Opt-out status updated",
        addToGroup: "Added to group",
        removeFromGroup: "Removed from group",
        delete: "Contacts deleted",
      };
      toast.success(msgs[input.action] ?? "Done");
      setSelectedIds(new Set());
      setBulkTagOpen(false);
      setBulkGroupOpen(false);
      invalidateContacts();
    },
    onError: () => toast.error("Bulk action failed"),
  });

  const exportMutation = useMutation({
    mutationFn: (ids?: string[]) => api.contacts.exportCsv({ ...filters, ...(ids ? { ids } : {}) }),
    onSuccess: (csv) => {
      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `contacts-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Contacts exported");
      setSelectedIds(new Set());
    },
    onError: () => toast.error("Export failed"),
  });

  const toggleColumn = (key: ColumnKey) => {
    setColumns((cols) => cols.map((c) => (c.key === key ? { ...c, visible: !c.visible } : c)));
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === q.data?.items.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(q.data?.items.map((c) => c.id) ?? []));
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const openDrawer = (contact: Contact) => {
    setSelectedContact(contact);
    setDrawerOpen(true);
  };

  const selectedIdList = [...selectedIds];
  const hasSelection = selectedIds.size > 0;

  const visibleColumns = columns.filter((c) => c.visible);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Contacts"
        description="Everyone who has messaged your business."
        actions={
          <>
            <Button variant="outline" onClick={() => setImportOpen(true)}>
              <Upload className="size-4 mr-2" />
              Import CSV
            </Button>
            <Button variant="outline" onClick={() => exportMutation.mutate(undefined)}>
              <Download className="size-4 mr-2" />
              Export
            </Button>
            <Button onClick={() => setAddOpen(true)}>
              <Plus className="size-4 mr-2" />
              Add contact
            </Button>
          </>
        }
      />

      <Card className="p-4">
        {/* Toolbar */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 items-center gap-2">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search contacts..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select
              value={selectedView}
              onValueChange={(v) => {
                setSelectedView(v);
                if (v === "opted-in") setOptedFilter("opted-in");
                else if (v === "all") {
                  setOptedFilter("all");
                  setTagFilter("all");
                  setSourceFilter("all");
                  setGroupFilter("all");
                }
              }}
            >
              <SelectTrigger className="w-[160px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SAVED_VIEWS.map((view) => (
                  <SelectItem key={view.id} value={view.id}>
                    {view.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={tagFilter} onValueChange={setTagFilter}>
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="Tag" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All tags</SelectItem>
                {(tagsQuery.data ?? []).map((t) => (
                  <SelectItem key={t.id} value={t.name}>
                    {t.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={sourceFilter} onValueChange={setSourceFilter}>
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="Source" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All sources</SelectItem>
                {(sourcesQuery.data ?? []).map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={optedFilter} onValueChange={setOptedFilter}>
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="Opt-in" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="opted-in">Opted in</SelectItem>
                <SelectItem value="opted-out">Opted out</SelectItem>
              </SelectContent>
            </Select>
            <Select value={groupFilter} onValueChange={setGroupFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Group" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All groups</SelectItem>
                {(groupsQuery.data ?? []).map((g) => (
                  <SelectItem key={g.id} value={g.id}>
                    {g.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            {selectedIds.size > 0 && (
              <>
                <Badge variant="secondary">{selectedIds.size} selected</Badge>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      Bulk actions
                      <ChevronDown className="ml-2 size-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => {
                        setBulkTagIds(selectedIdList);
                        setBulkTagOpen(true);
                      }}
                    >
                      <Tag className="mr-2 size-4" />
                      Add tag
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => {
                        setBulkGroupIds(selectedIdList);
                        setBulkGroupOpen(true);
                      }}
                    >
                      <Users className="mr-2 size-4" />
                      Add to group
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() =>
                        bulkMutation.mutate({
                          ids: selectedIdList,
                          action: "setOptedOut",
                          optedOut: true,
                        })
                      }
                    >
                      <LogOut className="mr-2 size-4" />
                      Mark opted out
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() =>
                        bulkMutation.mutate({
                          ids: selectedIdList,
                          action: "setOptedOut",
                          optedOut: false,
                        })
                      }
                    >
                      <Check className="mr-2 size-4" />
                      Mark opted in
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => exportMutation.mutate(selectedIdList)}>
                      <Download className="mr-2 size-4" />
                      Export CSV
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-destructive"
                      onClick={() => {
                        if (window.confirm(`Delete ${selectedIds.size} contacts?`)) {
                          bulkMutation.mutate({ ids: selectedIdList, action: "delete" });
                        }
                      }}
                    >
                      <X className="mr-2 size-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            )}
            <DropdownMenu open={columnChooserOpen} onOpenChange={setColumnChooserOpen}>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Filter className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Columns</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {columns.map((col) => (
                  <DropdownMenuItem
                    key={col.key}
                    onClick={() => toggleColumn(col.key)}
                    className="flex items-center justify-between"
                  >
                    <span>{col.label}</span>
                    {col.visible && <Check className="size-4" />}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Table */}
        {q.isPending ? (
          <ListSkeleton rows={8} />
        ) : q.isError ? (
          <ErrorState onRetry={() => q.refetch()} />
        ) : q.data.items.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No contacts yet"
            description="Import contacts from CSV or add them manually."
            action={
              <Button onClick={() => setImportOpen(true)}>
                <Upload className="size-4 mr-2" />
                Import CSV
              </Button>
            }
          />
        ) : (
          <div className="mt-4 overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedIds.size === q.data.items.length && q.data.items.length > 0}
                      onCheckedChange={toggleSelectAll}
                    />
                  </TableHead>
                  {visibleColumns.map((col) => (
                    <TableHead key={col.key}>{col.label}</TableHead>
                  ))}
                  <TableHead className="w-12" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {q.data.items.map((contact) => (
                  <TableRow
                    key={contact.id}
                    className={cn(
                      "cursor-pointer hover:bg-muted/50",
                      selectedIds.has(contact.id) && "bg-muted",
                    )}
                    onClick={() => openDrawer(contact)}
                  >
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        checked={selectedIds.has(contact.id)}
                        onCheckedChange={() => toggleSelect(contact.id)}
                      />
                    </TableCell>
                    {columns.find((c) => c.key === "name")?.visible && (
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <PresenceAvatar name={contact.name} />
                          <span className="font-medium">{contact.name}</span>
                        </div>
                      </TableCell>
                    )}
                    {columns.find((c) => c.key === "phone")?.visible && (
                      <TableCell className="tabular">{contact.phone}</TableCell>
                    )}
                    {columns.find((c) => c.key === "email")?.visible && (
                      <TableCell>{contact.email || "-"}</TableCell>
                    )}
                    {columns.find((c) => c.key === "city")?.visible && (
                      <TableCell>{contact.city}</TableCell>
                    )}
                    {columns.find((c) => c.key === "tags")?.visible && (
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {contact.tags.slice(0, 2).map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                          {contact.tags.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{contact.tags.length - 2}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                    )}
                    {columns.find((c) => c.key === "optedIn")?.visible && (
                      <TableCell>
                        {contact.optedIn ? (
                          <Badge className="bg-success text-success-foreground">
                            <Check className="mr-1 size-3" />
                            Opted in
                          </Badge>
                        ) : (
                          <Badge variant="outline">
                            <X className="mr-1 size-3" />
                            Opted out
                          </Badge>
                        )}
                      </TableCell>
                    )}
                    {columns.find((c) => c.key === "lifetimeValue")?.visible && (
                      <TableCell className="tabular">
                        ₹{formatNumber(contact.lifetimeValue)}
                      </TableCell>
                    )}
                    {columns.find((c) => c.key === "lastSeen")?.visible && (
                      <TableCell className="text-muted-foreground">
                        {timeAgo(contact.lastSeenAt)}
                      </TableCell>
                    )}
                    {columns.find((c) => c.key === "createdAt")?.visible && (
                      <TableCell className="text-muted-foreground">
                        {format(new Date(contact.createdAt), "MMM d, yyyy")}
                      </TableCell>
                    )}
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="size-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openDrawer(contact)}>
                            <Eye className="mr-2 size-4" />
                            View details
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <MessageSquare className="mr-2 size-4" />
                            Send message
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => {
                              setBulkTagIds([contact.id]);
                              setBulkTagOpen(true);
                            }}
                          >
                            <Tag className="mr-2 size-4" />
                            Add tag
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              setBulkGroupIds([contact.id]);
                              setBulkGroupOpen(true);
                            }}
                          >
                            <Users className="mr-2 size-4" />
                            Add to group
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

        {/* Pagination */}
        {q.data && q.data.total > q.data.pageSize && (
          <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
            <span>
              Page {q.data.page} of {Math.max(1, Math.ceil(q.data.total / q.data.pageSize))} ·{" "}
              {q.data.total} contacts
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={q.data.page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={q.data.page * q.data.pageSize >= q.data.total}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* CSV Import Dialog */}
      <ImportDialog open={importOpen} onOpenChange={setImportOpen} />

      {/* Add Contact Drawer */}
      <AddContactDrawer open={addOpen} onOpenChange={setAddOpen} />

      {/* Bulk tag/group dialogs */}
      <BulkTagDialog
        open={bulkTagOpen}
        onOpenChange={setBulkTagOpen}
        ids={bulkTagIds}
        onSubmit={(tags) => bulkMutation.mutate({ ids: bulkTagIds, action: "addTags", tags })}
        pending={bulkMutation.isPending}
      />
      <BulkGroupDialog
        open={bulkGroupOpen}
        onOpenChange={setBulkGroupOpen}
        ids={bulkGroupIds}
        onSubmit={(groupId) =>
          bulkMutation.mutate({ ids: bulkGroupIds, action: "addToGroup", groupId })
        }
        pending={bulkMutation.isPending}
      />

      {/* Contact Detail Drawer */}
      <ContactDrawer
        contact={selectedContact}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        onChanged={invalidateContacts}
      />
    </div>
  );
}

function ImportDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const qc = useQueryClient();
  const [step, setStep] = useState<"upload" | "preview" | "done">("upload");
  const [file, setFile] = useState<File | null>(null);
  const [csv, setCsv] = useState("");
  const [preview, setPreview] = useState<ImportPreview | null>(null);
  const [selected, setSelected] = useState<Set<number>>(new Set());

  const previewMutation = useMutation({
    mutationFn: (text: string) => api.contacts.importPreview(text),
    onSuccess: (p) => {
      setPreview(p);
      // Pre-select all importable rows
      setSelected(new Set(p.rows.filter((r) => r.status !== "invalid").map((r) => r.index)));
      setStep("preview");
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Couldn't parse CSV"),
  });

  const commitMutation = useMutation({
    mutationFn: (rows: CreateContactInput[]) => api.contacts.importCommit(rows),
    onSuccess: (r) => {
      toast.success(`Imported ${r.created} new, updated ${r.updated} existing`);
      qc.invalidateQueries({ queryKey: ["contacts"] });
      setStep("done");
    },
    onError: () => toast.error("Import failed"),
  });

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    const text = await f.text();
    setCsv(text);
    previewMutation.mutate(text);
  };

  const handleClose = () => {
    setStep("upload");
    setFile(null);
    setCsv("");
    setPreview(null);
    setSelected(new Set());
    onOpenChange(false);
  };

  const commitRows = () => {
    if (!preview) return;
    const rows = preview.rows
      .filter((r) => selected.has(r.index) && r.status !== "invalid")
      .map((r) => r.data);
    commitMutation.mutate(rows);
  };

  const toggleRow = (index: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Import contacts from CSV</DialogTitle>
          <DialogDescription>
            {step === "upload" &&
              "Upload a CSV file. Columns: name, phone (required), email, city, company, tags."}
            {step === "preview" && "Review the parsed rows, then confirm the import."}
            {step === "done" && "Import complete."}
          </DialogDescription>
        </DialogHeader>

        {step === "upload" && (
          <div className="space-y-4 py-4">
            <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-8">
              <Upload className="size-12 text-muted-foreground mb-4" />
              <p className="text-sm text-muted-foreground mb-2">
                Drag and drop your CSV file here, or click to browse
              </p>
              <Input
                type="file"
                accept=".csv,text/csv"
                onChange={handleUpload}
                className="max-w-xs"
                disabled={previewMutation.isPending}
              />
              {previewMutation.isPending && (
                <p className="mt-3 text-sm text-muted-foreground">Parsing…</p>
              )}
            </div>
            <div className="text-sm text-muted-foreground">
              <p className="font-medium mb-1">CSV format:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>First row = headers (name, phone, email, city, company, tags)</li>
                <li>Phone is required — +91 is assumed for 10-digit Indian numbers</li>
                <li>Existing phones are updated, not duplicated</li>
              </ul>
            </div>
          </div>
        )}

        {step === "preview" && preview && (
          <div className="space-y-4 py-4">
            <div className="grid gap-3 sm:grid-cols-4">
              {(
                [
                  ["Total", preview.totals.total, ""],
                  ["New", preview.totals.new, "text-success"],
                  ["Duplicates", preview.totals.duplicates, "text-warning"],
                  ["Invalid", preview.totals.invalid, "text-destructive"],
                ] as const
              ).map(([label, val, cls]) => (
                <div key={label} className="rounded-md border p-3 text-center">
                  <p className={cn("text-xl font-bold tabular", cls)}>{val}</p>
                  <p className="text-xs text-muted-foreground">{label}</p>
                </div>
              ))}
            </div>
            <div className="max-h-72 overflow-y-auto rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-10" />
                    <TableHead>Row</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {preview.rows.map((r) => (
                    <TableRow key={r.index}>
                      <TableCell>
                        <Checkbox
                          checked={selected.has(r.index)}
                          disabled={r.status === "invalid"}
                          onCheckedChange={() => toggleRow(r.index)}
                        />
                      </TableCell>
                      <TableCell className="tabular">{r.index}</TableCell>
                      <TableCell>{r.data.name || "—"}</TableCell>
                      <TableCell className="tabular">{r.data.phone}</TableCell>
                      <TableCell>
                        {r.status === "new" && (
                          <Badge className="bg-success text-success-foreground">New</Badge>
                        )}
                        {r.status === "duplicate" && (
                          <Badge variant="secondary">
                            Duplicate{r.existingId ? " (will update)" : ""}
                          </Badge>
                        )}
                        {r.status === "invalid" && (
                          <Badge variant="destructive">{r.errors[0] ?? "Invalid"}</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}

        {step === "done" && (
          <div className="py-8 text-center">
            <Check className="mx-auto size-10 text-success mb-3" />
            <p className="font-medium">Contacts imported</p>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            {step === "done" ? "Close" : "Cancel"}
          </Button>
          {step === "preview" && (
            <Button
              onClick={commitRows}
              loading={commitMutation.isPending}
              disabled={selected.size === 0}
            >
              Import {selected.size} contacts
            </Button>
          )}
          {step === "upload" && file && previewMutation.isPending && (
            <Button disabled>Parsing…</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function BulkTagDialog({
  open,
  onOpenChange,
  ids,
  onSubmit,
  pending,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ids: string[];
  onSubmit: (tags: string[]) => void;
  pending: boolean;
}) {
  const [value, setValue] = useState("");
  const tags = value
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>
            Add tags to {ids.length} contact{ids.length === 1 ? "" : "s"}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-2 py-2">
          <Label>Tags (comma separated)</Label>
          <Input
            placeholder="e.g., VIP, Diwali campaign"
            value={value}
            onChange={(e) => setValue(e.target.value)}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={() => onSubmit(tags)} loading={pending} disabled={tags.length === 0}>
            Add tags
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function BulkGroupDialog({
  open,
  onOpenChange,
  ids,
  onSubmit,
  pending,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ids: string[];
  onSubmit: (groupId: string) => void;
  pending: boolean;
}) {
  const [groupId, setGroupId] = useState("");
  const groups = useQuery({ queryKey: ["groups"], queryFn: () => api.groups.list() });
  const staticGroups = (groups.data ?? []).filter((g) => g.kind === "static");
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Add to group</DialogTitle>
          <DialogDescription>
            Add {ids.length} contact{ids.length === 1 ? "" : "s"} to a static group.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2 py-2">
          <Label>Group</Label>
          <Select value={groupId} onValueChange={setGroupId}>
            <SelectTrigger>
              <SelectValue placeholder="Select a group" />
            </SelectTrigger>
            <SelectContent>
              {staticGroups.map((g) => (
                <SelectItem key={g.id} value={g.id}>
                  {g.name} ({g.memberCount})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {staticGroups.length === 0 && (
            <p className="text-xs text-muted-foreground">
              No static groups yet — create one on the Groups page.
            </p>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={() => onSubmit(groupId)} loading={pending} disabled={!groupId}>
            Add to group
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function AddContactDrawer({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const qc = useQueryClient();
  const [form, setForm] = useState({
    phone: "",
    name: "",
    email: "",
    company: "",
    designation: "",
    country: "IN",
    city: "",
    tags: "",
    createLead: false,
    optedOut: false,
  });

  const create = useMutation({
    mutationFn: () =>
      api.contacts.create({
        phone: form.phone,
        name: form.name || undefined,
        email: form.email || undefined,
        company: form.company || undefined,
        designation: form.designation || undefined,
        country: form.country || undefined,
        city: form.city || undefined,
        tags: form.tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
        createLead: form.createLead,
        optedOut: form.optedOut,
        source: "manual",
      }),
    onSuccess: () => {
      toast.success("Contact added");
      qc.invalidateQueries({ queryKey: ["contacts"] });
      qc.invalidateQueries({ queryKey: ["leads"] });
      setForm({
        phone: "",
        name: "",
        email: "",
        company: "",
        designation: "",
        country: "IN",
        city: "",
        tags: "",
        createLead: false,
        optedOut: false,
      });
      onOpenChange(false);
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Couldn't add contact"),
  });

  const set = (k: keyof typeof form, v: string | boolean) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-w-md mx-auto">
        <DrawerHeader>
          <DrawerTitle>Add contact</DrawerTitle>
        </DrawerHeader>
        <form
          className="space-y-4 px-4 pb-6"
          onSubmit={(e) => {
            e.preventDefault();
            create.mutate();
          }}
        >
          <div className="space-y-1.5">
            <Label htmlFor="c-phone">Phone</Label>
            <div className="flex gap-2">
              <Select value={form.country} onValueChange={(v) => set("country", v)}>
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="IN">+91</SelectItem>
                  <SelectItem value="US">+1</SelectItem>
                  <SelectItem value="GB">+44</SelectItem>
                  <SelectItem value="AE">+971</SelectItem>
                  <SelectItem value="SG">+65</SelectItem>
                </SelectContent>
              </Select>
              <Input
                id="c-phone"
                placeholder="98765 43210"
                value={form.phone}
                onChange={(e) => set("phone", e.target.value)}
                required
                className="flex-1"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              {form.country === "IN" ? "+91 assumed for 10-digit numbers" : "Include country code"}
            </p>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="c-name">Name</Label>
            <Input id="c-name" value={form.name} onChange={(e) => set("name", e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="c-email">Email</Label>
            <Input
              id="c-email"
              type="email"
              value={form.email}
              onChange={(e) => set("email", e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="c-company">Company</Label>
              <Input
                id="c-company"
                value={form.company}
                onChange={(e) => set("company", e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="c-role">Role</Label>
              <Input
                id="c-role"
                placeholder="e.g., Owner"
                value={form.designation}
                onChange={(e) => set("designation", e.target.value)}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="c-country">Country</Label>
              <Input
                id="c-country"
                value={form.country}
                onChange={(e) => set("country", e.target.value.toUpperCase())}
                maxLength={2}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="c-city">City</Label>
              <Input id="c-city" value={form.city} onChange={(e) => set("city", e.target.value)} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="c-tags">Tags</Label>
            <Input
              id="c-tags"
              placeholder="Comma separated"
              value={form.tags}
              onChange={(e) => set("tags", e.target.value)}
            />
          </div>
          <div className="flex items-center justify-between rounded-md border px-3 py-2">
            <div>
              <p className="text-sm font-medium">Also add as lead</p>
              <p className="text-xs text-muted-foreground">Creates a lead in stage “new”</p>
            </div>
            <Switch checked={form.createLead} onCheckedChange={(v) => set("createLead", v)} />
          </div>
          <div className="flex items-center justify-between rounded-md border px-3 py-2">
            <div>
              <p className="text-sm font-medium">Opted out</p>
              <p className="text-xs text-muted-foreground">Exclude from broadcasts</p>
            </div>
            <Switch checked={form.optedOut} onCheckedChange={(v) => set("optedOut", v)} />
          </div>
          <Button
            type="submit"
            className="w-full"
            loading={create.isPending}
            disabled={!form.phone.trim()}
          >
            Add contact
          </Button>
        </form>
      </DrawerContent>
    </Drawer>
  );
}

function ContactDrawer({
  contact,
  open,
  onOpenChange,
  onChanged,
}: {
  contact: Contact | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onChanged: () => void;
}) {
  const qc = useQueryClient();
  const [notes, setNotes] = useState("");
  useEffect(() => {
    setNotes(contact?.notes ?? "");
  }, [contact?.id, contact?.notes]);

  const saveNotes = useMutation({
    mutationFn: () => api.contacts.updateNotes(contact!.id, notes),
    onSuccess: () => {
      toast.success("Notes saved");
      qc.invalidateQueries({ queryKey: ["contacts"] });
      onChanged();
    },
    onError: () => toast.error("Couldn't save notes"),
  });

  const toggleOptOut = useMutation({
    mutationFn: (optedOut: boolean) => api.contacts.update(contact!.id, { optedOut }),
    onSuccess: () => {
      toast.success("Opt-out status updated");
      qc.invalidateQueries({ queryKey: ["contacts"] });
      onChanged();
    },
    onError: () => toast.error("Update failed"),
  });

  if (!contact) return null;

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-w-md mx-auto">
        <DrawerHeader>
          <div className="flex items-center gap-4">
            <PresenceAvatar name={contact.name} size="lg" />
            <div className="flex-1">
              <DrawerTitle>{contact.name}</DrawerTitle>
              <p className="text-sm text-muted-foreground">{contact.phone}</p>
            </div>
          </div>
        </DrawerHeader>
        <div className="space-y-6 px-4 pb-4">
          <div className="space-y-3">
            <h3 className="text-sm font-medium">Contact Information</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Phone className="size-4 text-muted-foreground" />
                <span>{contact.phone}</span>
              </div>
              {contact.email && (
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="size-4 text-muted-foreground" />
                  <span>{contact.email}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="size-4 text-muted-foreground" />
                <span>{[contact.city, contact.country].filter(Boolean).join(", ") || "—"}</span>
              </div>
              {contact.company && (
                <div className="flex items-center gap-2 text-sm">
                  <Users className="size-4 text-muted-foreground" />
                  <span>
                    {contact.company}
                    {contact.designation ? ` · ${contact.designation}` : ""}
                  </span>
                </div>
              )}
              {contact.source && (
                <div className="flex items-center gap-2 text-sm">
                  <FileText className="size-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Source: {contact.source}</span>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium">Opt-in Status</h3>
              <Switch
                checked={!contact.optedIn}
                onCheckedChange={(v) => toggleOptOut.mutate(v)}
                disabled={toggleOptOut.isPending}
              />
            </div>
            {contact.optedIn ? (
              <Badge className="bg-success text-success-foreground">
                <Check className="mr-1 size-3" />
                Opted in
              </Badge>
            ) : (
              <Badge variant="outline">
                <X className="mr-1 size-3" />
                Opted out
              </Badge>
            )}
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-medium">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {contact.tags.map((tag) => (
                <Badge key={tag} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-medium">Custom Fields</h3>
            <div className="space-y-2">
              {contact.customFields.map((field) => (
                <div key={field.label} className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{field.label}</span>
                  <span>{field.value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-medium">Notes</h3>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add notes about this contact…"
              rows={3}
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => saveNotes.mutate()}
              loading={saveNotes.isPending}
              disabled={notes === (contact.notes ?? "")}
            >
              Save notes
            </Button>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-medium">Activity</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Lifetime value</span>
                <span className="font-medium tabular">₹{formatNumber(contact.lifetimeValue)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Last seen</span>
                <span>{timeAgo(contact.lastSeenAt)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Created</span>
                <span>{format(new Date(contact.createdAt), "MMM d, yyyy")}</span>
              </div>
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button className="flex-1">
              <MessageSquare className="mr-2 size-4" />
              Send message
            </Button>
            <Button variant="outline" className="flex-1">
              <FileText className="mr-2 size-4" />
              Edit
            </Button>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
