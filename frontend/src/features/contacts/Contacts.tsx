import { useState } from "react";
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
  UserPlus,
  LogOut,
  ChevronDown,
  Eye,
  EyeOff,
  Phone,
  Mail,
  MapPin,
  Calendar,
  DollarSign,
  MessageSquare,
  FileText,
  AlertCircle,
} from "lucide-react";
import { api, type Contact } from "@/api";
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
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
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
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [columns, setColumns] = useState<Column[]>(DEFAULT_COLUMNS);
  const [selectedView, setSelectedView] = useState("all");
  const [columnChooserOpen, setColumnChooserOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const q = useQuery({
    queryKey: ["contacts", { search }],
    queryFn: () => api.contacts.list({ search, pageSize: 50 }),
  });

  const toggleColumn = (key: ColumnKey) => {
    setColumns((cols) =>
      cols.map((c) => (c.key === key ? { ...c, visible: !c.visible } : c)),
    );
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

  const exportSelected = () => {
    toast.success(`Exporting ${selectedIds.size} contacts to CSV`);
    setSelectedIds(new Set());
  };

  const assignOwner = () => {
    toast.success(`Assigned ${selectedIds.size} contacts to owner`);
    setSelectedIds(new Set());
  };

  const addToGroup = () => {
    toast.success(`Added ${selectedIds.size} contacts to group`);
    setSelectedIds(new Set());
  };

  const bulkTag = () => {
    toast.success(`Tagged ${selectedIds.size} contacts`);
    setSelectedIds(new Set());
  };

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
            <Button>
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
            <Select value={selectedView} onValueChange={setSelectedView}>
              <SelectTrigger className="w-[180px]">
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
                    <DropdownMenuItem onClick={bulkTag}>
                      <Tag className="mr-2 size-4" />
                      Add tag
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={addToGroup}>
                      <Users className="mr-2 size-4" />
                      Add to group
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={assignOwner}>
                      <UserPlus className="mr-2 size-4" />
                      Assign owner
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={exportSelected}>
                      <Download className="mr-2 size-4" />
                      Export CSV
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            )}
            <DropdownMenu
              open={columnChooserOpen}
              onOpenChange={setColumnChooserOpen}
            >
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
                      checked={
                        selectedIds.size === q.data.items.length &&
                        q.data.items.length > 0
                      }
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
                            <Badge
                              key={tag}
                              variant="secondary"
                              className="text-xs"
                            >
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
                    {columns.find((c) => c.key === "lifetimeValue")
                      ?.visible && (
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
                          <DropdownMenuItem>
                            <Tag className="mr-2 size-4" />
                            Add tag
                          </DropdownMenuItem>
                          <DropdownMenuItem>
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
      </Card>

      {/* CSV Import Dialog */}
      <ImportDialog open={importOpen} onOpenChange={setImportOpen} />

      {/* Contact Detail Drawer */}
      <ContactDrawer
        contact={selectedContact}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
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
  const [step, setStep] = useState<"upload" | "map" | "validate" | "confirm">(
    "upload",
  );
  const [file, setFile] = useState<File | null>(null);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      setStep("map");
    }
  };

  const handleClose = () => {
    setStep("upload");
    setFile(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Import contacts from CSV</DialogTitle>
          <DialogDescription>
            {step === "upload" && "Upload your CSV file to get started."}
            {step === "map" && "Map your CSV columns to contact fields."}
            {step === "validate" && "Review and fix any validation errors."}
            {step === "confirm" && "Confirm the import details."}
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
                accept=".csv"
                onChange={handleUpload}
                className="max-w-xs"
              />
            </div>
            <div className="text-sm text-muted-foreground">
              <p className="font-medium mb-1">CSV format requirements:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>First row should contain column headers</li>
                <li>Required columns: name, phone</li>
                <li>Optional columns: email, city, tags</li>
              </ul>
            </div>
          </div>
        )}

        {step === "map" && (
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>CSV Preview</Label>
              <div className="rounded-md border p-4 text-sm font-mono">
                <div className="text-muted-foreground mb-2">
                  name,phone,email,city
                </div>
                <div>John Doe,+91 98765 43210,john@example.com,Mumbai</div>
                <div>Jane Smith,+91 87654 32109,,Delhi</div>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Column Mapping</Label>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="w-24 text-sm">name →</span>
                  <Select defaultValue="name">
                    <SelectTrigger className="flex-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="name">Name</SelectItem>
                      <SelectItem value="phone">Phone</SelectItem>
                      <SelectItem value="email">Email</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-24 text-sm">phone →</span>
                  <Select defaultValue="phone">
                    <SelectTrigger className="flex-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="name">Name</SelectItem>
                      <SelectItem value="phone">Phone</SelectItem>
                      <SelectItem value="email">Email</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>
        )}

        {step === "validate" && (
          <div className="space-y-4 py-4">
            <div className="flex items-center gap-2 text-sm">
              <AlertCircle className="size-4 text-warning" />
              <span>2 rows have validation errors</span>
            </div>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Row</TableHead>
                    <TableHead>Error</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>3</TableCell>
                    <TableCell>Invalid phone format</TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm">
                        Fix
                      </Button>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>7</TableCell>
                    <TableCell>Missing required field: name</TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm">
                        Fix
                      </Button>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </div>
        )}

        {step === "confirm" && (
          <div className="space-y-4 py-4">
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-md border p-4 text-center">
                <p className="text-2xl font-bold tabular">48</p>
                <p className="text-sm text-muted-foreground">Total rows</p>
              </div>
              <div className="rounded-md border p-4 text-center">
                <p className="text-2xl font-bold tabular text-success">46</p>
                <p className="text-sm text-muted-foreground">Valid</p>
              </div>
              <div className="rounded-md border p-4 text-center">
                <p className="text-2xl font-bold tabular text-destructive">2</p>
                <p className="text-sm text-muted-foreground">Errors</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              46 contacts will be imported. 2 rows with errors will be skipped.
            </p>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          {step === "upload" && (
            <Button disabled={!file} onClick={() => setStep("map")}>
              Next
            </Button>
          )}
          {step === "map" && (
            <>
              <Button variant="outline" onClick={() => setStep("upload")}>
                Back
              </Button>
              <Button onClick={() => setStep("validate")}>Next</Button>
            </>
          )}
          {step === "validate" && (
            <>
              <Button variant="outline" onClick={() => setStep("map")}>
                Back
              </Button>
              <Button onClick={() => setStep("confirm")}>Next</Button>
            </>
          )}
          {step === "confirm" && (
            <>
              <Button variant="outline" onClick={() => setStep("validate")}>
                Back
              </Button>
              <Button
                onClick={() => {
                  toast.success("Contacts imported successfully");
                  handleClose();
                }}
              >
                Import contacts
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ContactDrawer({
  contact,
  open,
  onOpenChange,
}: {
  contact: Contact | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
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
                <span>{contact.city}</span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-medium">Opt-in Status</h3>
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
            <p className="text-sm text-muted-foreground">
              {contact.notes || "No notes"}
            </p>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-medium">Activity</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Lifetime value</span>
                <span className="font-medium tabular">
                  ₹{formatNumber(contact.lifetimeValue)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Last seen</span>
                <span>{timeAgo(contact.lastSeenAt)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Created</span>
                <span>
                  {format(new Date(contact.createdAt), "MMM d, yyyy")}
                </span>
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
