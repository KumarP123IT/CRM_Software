import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  FileText,
  Plus,
  Search,
  MoreHorizontal,
  Check,
  X,
  Clock,
  AlertCircle,
  Image as ImageIcon,
  MessageSquare,
  ChevronDown,
  Send,
  Play,
  Eye,
  Trash2,
  Edit,
  Copy,
} from "lucide-react";
import { api, type CreateTemplateInput, type Template } from "@/api";
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
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { formatNumber } from "@/lib/format";

type TemplateStatus = Template["status"];

interface TemplateButton {
  id: string;
  text: string;
}

interface TemplateForm {
  name: string;
  category: "Marketing" | "Utility" | "Authentication";
  language: string;
  headerMedia?: string;
  body: string;
  buttons: TemplateButton[];
  rejectionReason?: string;
}

const CATEGORIES = ["Marketing", "Utility", "Authentication"] as const;
const LANGUAGES = ["en", "hi-en", "hi", "ta", "te", "bn", "mr", "gu", "kn", "ml"] as const;

const STATUS_CONFIG: Record<
  TemplateStatus,
  {
    label: string;
    variant: "default" | "secondary" | "outline" | "destructive";
    icon: typeof Clock;
  }
> = {
  draft: { label: "Draft", variant: "secondary", icon: FileText },
  pending: { label: "Pending", variant: "outline", icon: Clock },
  approved: { label: "Approved", variant: "default", icon: Check },
  rejected: { label: "Rejected", variant: "destructive", icon: AlertCircle },
};

export function Templates() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<Template | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);

  const q = useQuery({
    queryKey: ["templates"],
    queryFn: () => api.templates.list(),
  });

  const filteredTemplates =
    q.data?.filter((t) => t.name.toLowerCase().includes(search.toLowerCase())) ?? [];

  const invalidate = () => void qc.invalidateQueries({ queryKey: ["templates"] });
  const onError = (e: unknown) =>
    toast.error(e instanceof Error ? e.message : "Something went wrong");

  const submitForApproval = useMutation({
    mutationFn: (id: string) => api.templates.submit(id),
    onSuccess: () => {
      toast.success("Template submitted for approval");
      invalidate();
    },
    onError,
  });

  const approveTemplate = useMutation({
    mutationFn: (id: string) => api.templates.approve(id),
    onSuccess: () => {
      toast.success("Template approved");
      invalidate();
    },
    onError,
  });

  const rejectTemplate = useMutation({
    mutationFn: (id: string) => api.templates.reject(id),
    onSuccess: () => {
      toast.success("Template rejected");
      invalidate();
    },
    onError,
  });

  const deleteTemplate = useMutation({
    mutationFn: (id: string) => api.templates.remove(id),
    onSuccess: () => {
      toast.success("Template deleted");
      invalidate();
    },
    onError,
  });

  const duplicateTemplate = useMutation({
    mutationFn: (template: Template) =>
      api.templates.create({
        name: `${template.name}_copy`.slice(0, 120),
        category: template.category,
        language: template.language,
        body: template.body,
        headerMedia: template.headerMedia,
        buttons: template.buttons,
      }),
    onSuccess: () => {
      toast.success("Template duplicated");
      invalidate();
    },
    onError,
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Templates"
        description="WhatsApp message templates for broadcasts and automation."
        actions={
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="size-4 mr-2" />
            Create template
          </Button>
        }
      />

      <Card className="p-4">
        {/* Search */}
        <div className="relative max-w-sm mb-4">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search templates..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Table */}
        {q.isPending ? (
          <ListSkeleton rows={4} />
        ) : q.isError ? (
          <ErrorState onRetry={() => q.refetch()} />
        ) : filteredTemplates.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="No templates yet"
            description="Create a template to send consistent messages at scale."
            action={
              <Button onClick={() => setCreateOpen(true)}>
                <Plus className="size-4 mr-2" />
                Create template
              </Button>
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Language</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-12" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTemplates.map((template) => {
                  const config = STATUS_CONFIG[template.status as TemplateStatus];
                  const StatusIcon = config.icon;
                  return (
                    <TableRow key={template.id}>
                      <TableCell className="font-medium">{template.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{template.category}</Badge>
                      </TableCell>
                      <TableCell>{template.language}</TableCell>
                      <TableCell>
                        <Badge variant={config.variant} className="gap-1">
                          <StatusIcon className="size-3" />
                          {config.label}
                        </Badge>
                        {template.status === "rejected" && (
                          <p className="text-xs text-destructive mt-1">
                            Rejected: {template.rejectionReason ?? "Rejected by provider"}
                          </p>
                        )}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="size-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedTemplate(template);
                                setPreviewOpen(true);
                              }}
                            >
                              <Eye className="mr-2 size-4" />
                              Preview
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                setEditing(template);
                                setCreateOpen(true);
                              }}
                            >
                              <Edit className="mr-2 size-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => duplicateTemplate.mutate(template)}>
                              <Copy className="mr-2 size-4" />
                              Duplicate
                            </DropdownMenuItem>
                            {(template.status === "draft" || template.status === "rejected") && (
                              <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => submitForApproval.mutate(template.id)}
                                >
                                  <Send className="mr-2 size-4" />
                                  Submit for approval
                                </DropdownMenuItem>
                              </>
                            )}
                            {template.status === "pending" && (
                              <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => approveTemplate.mutate(template.id)}
                                >
                                  <Check className="mr-2 size-4" />
                                  Approve
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => rejectTemplate.mutate(template.id)}
                                >
                                  <X className="mr-2 size-4" />
                                  Reject
                                </DropdownMenuItem>
                              </>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => deleteTemplate.mutate(template.id)}
                            >
                              <Trash2 className="mr-2 size-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>

      {/* Create/Edit Dialog */}
      <TemplateDialog
        open={createOpen}
        onOpenChange={(open) => {
          setCreateOpen(open);
          if (!open) setEditing(null);
        }}
        template={editing}
      />

      {/* Preview Dialog */}
      <TemplatePreviewDialog
        template={selectedTemplate}
        open={previewOpen}
        onOpenChange={setPreviewOpen}
      />
    </div>
  );
}

function TemplateDialog({
  open,
  onOpenChange,
  template,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  template?: Template | null;
}) {
  const qc = useQueryClient();
  const emptyForm: TemplateForm = {
    name: "",
    category: "Utility",
    language: "en",
    body: "",
    buttons: [],
  };
  const [form, setForm] = useState<TemplateForm>(emptyForm);
  const [headerMedia, setHeaderMedia] = useState<File | null>(null);

  // Reset the form whenever the dialog opens (create vs. edit target).
  useEffect(() => {
    if (!open) return;
    setHeaderMedia(null);
    setForm(
      template
        ? {
            name: template.name,
            category: template.category,
            language: template.language,
            body: template.body,
            buttons: (template.buttons ?? []).map((b, i) => ({
              id: b.id ?? `btn${i + 1}`,
              text: b.text,
            })),
            ...(template.headerMedia ? { headerMedia: template.headerMedia } : {}),
          }
        : emptyForm,
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, template]);

  const save = useMutation({
    mutationFn: (input: CreateTemplateInput) =>
      template ? api.templates.update(template.id, input) : api.templates.create(input),
    onSuccess: () => {
      toast.success(template ? "Template updated" : "Template saved as draft");
      void qc.invalidateQueries({ queryKey: ["templates"] });
      onOpenChange(false);
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Something went wrong"),
  });

  const addButton = () => {
    setForm({
      ...form,
      buttons: [...form.buttons, { id: `btn${form.buttons.length + 1}`, text: "" }],
    });
  };

  const removeButton = (id: string) => {
    setForm({
      ...form,
      buttons: form.buttons.filter((b) => b.id !== id),
    });
  };

  const updateButton = (id: string, text: string) => {
    setForm({
      ...form,
      buttons: form.buttons.map((b) => (b.id === id ? { ...b, text } : b)),
    });
  };

  const handleSubmit = () => {
    save.mutate({
      name: form.name.trim(),
      category: form.category,
      language: form.language,
      body: form.body,
      buttons: form.buttons
        .filter((b) => b.text.trim())
        .map((b) => ({ id: b.id, text: b.text.trim() })),
      ...(form.headerMedia ? { headerMedia: form.headerMedia } : {}),
    });
  };

  // Extract variables from body ({{1}}, {{2}}, etc.)
  const variables = form.body.match(/\{\{\d+\}\}/g) ?? [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {template ? "Edit message template" : "Create message template"}
          </DialogTitle>
          <DialogDescription>
            Templates must be approved by WhatsApp before use. Use variables like {"{"}
            {"}{"} 1 {"}"}
            {"}"} to personalize messages.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4 lg:grid-cols-2">
          {/* Form */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Template name</Label>
              <Input
                id="name"
                placeholder="e.g., order_confirmation"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Category</Label>
                <Select
                  value={form.category}
                  onValueChange={(v) =>
                    setForm({ ...form, category: v as TemplateForm["category"] })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Language</Label>
                <Select
                  value={form.language}
                  onValueChange={(v) => setForm({ ...form, language: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {LANGUAGES.map((lang) => (
                      <SelectItem key={lang} value={lang}>
                        {lang.toUpperCase()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Header media (optional)</Label>
              <div className="flex items-center gap-2">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setHeaderMedia(e.target.files?.[0] ?? null)}
                  className="flex-1"
                />
                {headerMedia && (
                  <Button variant="outline" size="sm" onClick={() => setHeaderMedia(null)}>
                    <X className="size-4" />
                  </Button>
                )}
              </div>
              <p className="text-xs text-muted-foreground">Recommended: 1120x1120px, max 5MB</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="body">Message body</Label>
              <Textarea
                id="body"
                placeholder="Hi {{1}}, your order #{{2}} is confirmed..."
                value={form.body}
                onChange={(e) => setForm({ ...form, body: e.target.value })}
                rows={6}
              />
              {variables.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {variables.map((v, i) => (
                    <Badge key={i} variant="secondary" className="gap-1">
                      <MessageSquare className="size-3" />
                      {v}
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Buttons (optional)</Label>
                <Button variant="outline" size="sm" onClick={addButton}>
                  <Plus className="size-3 mr-1" />
                  Add button
                </Button>
              </div>
              <div className="space-y-2">
                {form.buttons.map((btn) => (
                  <div key={btn.id} className="flex gap-2">
                    <Input
                      placeholder="Button text"
                      value={btn.text}
                      onChange={(e) => updateButton(btn.id, e.target.value)}
                    />
                    <Button variant="ghost" size="sm" onClick={() => removeButton(btn.id)}>
                      <X className="size-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Preview */}
          <div className="space-y-4">
            <Label>WhatsApp preview</Label>
            <WhatsAppPreview headerMedia={headerMedia} body={form.body} buttons={form.buttons} />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!form.name || !form.body || save.isPending}>
            {template ? "Save changes" : "Save as draft"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function WhatsAppPreview({
  headerMedia,
  body,
  buttons,
}: {
  headerMedia: File | null;
  body: string;
  buttons: TemplateButton[];
}) {
  return (
    <div className="mx-auto w-[320px] rounded-3xl border-4 border-gray-900 bg-gray-50 p-3">
      {/* Phone notch */}
      <div className="mx-auto mb-3 h-6 w-24 rounded-b-xl bg-gray-900" />

      {/* Chat preview */}
      <div className="space-y-2">
        {/* Header media */}
        {headerMedia && (
          <div className="relative rounded-lg overflow-hidden bg-gray-200">
            <img
              src={URL.createObjectURL(headerMedia)}
              alt="Header"
              className="w-full h-32 object-cover"
            />
          </div>
        )}

        {/* Message body */}
        <div className="rounded-lg bg-white p-3 shadow-sm">
          {body || <p className="text-gray-400 italic">Your message will appear here...</p>}
        </div>

        {/* Buttons */}
        {buttons.length > 0 && (
          <div className="space-y-1">
            {buttons.map((btn) => (
              <button
                key={btn.id}
                className="w-full rounded-lg bg-white border p-2 text-sm text-blue-600 shadow-sm"
              >
                {btn.text || "Button text"}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function TemplatePreviewDialog({
  template,
  open,
  onOpenChange,
}: {
  template: Template | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  if (!template) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{template.name}</DialogTitle>
          <DialogDescription>
            {template.category} • {template.language}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <WhatsAppPreview headerMedia={null} body={template.body} buttons={[]} />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
