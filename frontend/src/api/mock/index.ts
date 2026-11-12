import type {
  Ad,
  AnalyticsOverview,
  Api,
  ApiKey,
  AutoReply,
  BusinessHoursConfig,
  Broadcast,
  BroadcastListParams,
  BroadcastRecipient,
  BroadcastRecipientStatus,
  CallLog,
  CallReminder,
  Campaign,
  CampaignDetail,
  CampaignStatus,
  Channel,
  ConnectInboxInput,
  Contact,
  CreateAdInput,
  CreateAutoReplyInput,
  CreateBotInput,
  ContactGroup,
  ContactListParams,
  Conversation,
  CreateBroadcastInput,
  CreateCallLogInput,
  CreateCallReminderInput,
  CreateCampaignInput,
  CreateContactInput,
  CreateLeadInput,
  CreateTemplateInput,
  GroupDetail,
  GroupRule,
  ImportPreview,
  Inbox,
  Lead,
  LeadListParams,
  ListParams,
  Message,
  Page,
  Tag,
  Template,
  UpdateAdInput,
  UpdateAutoReplyInput,
  WebhookEndpoint,
  UpdateBotInput,
  UpdateBroadcastInput,
  UpdateCallReminderInput,
  UpdateCampaignInput,
  UpdateLeadInput,
  UpdateTemplateInput,
  UpdateWorkspaceInput,
  User,
  ID,
} from "../types";
import { HttpError } from "../http";
import * as db from "./data";

const latency = () =>
  import.meta.env.MODE === "test"
    ? Promise.resolve()
    : new Promise((r) => setTimeout(r, 250 + Math.random() * 350));

/** Seeded mock users share this password. Register stores the submitted password. */
export const MOCK_PASSWORD = "password";

const users: User[] = db.team.map((u) => ({ ...u }));
const passwords = new Map<string, string>(users.map((u) => [u.email.toLowerCase(), MOCK_PASSWORD]));
const takenSlugs = new Set(["taken", "chai-point-cafe"]);

const messages = new Map<string, Message[]>(
  db.conversations.map((c) => [
    c.id,
    [
      {
        id: `${c.id}-m1`,
        conversationId: c.id,
        direction: "in" as const,
        kind: "text" as const,
        body: c.lastMessage,
        sentAt: c.lastMessageAt,
      },
    ],
  ]),
);

const inboxListeners = new Set<(event: import("../types").InboxEvent) => void>();

const inboxStore: Inbox[] = [
  {
    id: "inbox_wa_1",
    name: "Chai Point Café",
    type: "whatsapp",
    status: "connected",
    phoneNumber: "+91 98765 43210",
    qualityRating: "High",
    messagingTier: "Tier 2",
    webhookVerified: true,
    autoAssign: true,
    createdAt: new Date(Date.now() - 86400_000 * 30).toISOString(),
  },
];

function paginate<T>(items: T[], params: ListParams = {}): Page<T> {
  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? 20;
  return {
    items: items.slice((page - 1) * pageSize, page * pageSize),
    total: items.length,
    page,
    pageSize,
  };
}

function matches(c: Contact | Conversation, q?: string) {
  if (!q) return true;
  const s = q.toLowerCase();
  if ("phone" in c)
    return (
      c.name.toLowerCase().includes(s) || c.phone.replace(/\s/g, "").includes(s.replace(/\s/g, ""))
    );
  return c.contactName.toLowerCase().includes(s) || c.lastMessage.toLowerCase().includes(s);
}

function notFound(entity: string): never {
  throw new HttpError({
    status: 404,
    code: "not_found",
    message: `${entity} not found`,
  });
}

function forbidden(): never {
  throw new HttpError({ status: 403, code: "forbidden", message: "Forbidden" });
}

/* ---------- contacts helpers (mirror backend behaviour) ---------- */

const contacts: Contact[] = db.contacts.map((c) => ({
  ...c,
  source: "mock",
  notes: c.notes ?? "",
}));

function normalizePhone(raw: string): string | null {
  let p = raw.trim().replace(/[\s\-()]/g, "");
  if (!p) return null;
  if (p.startsWith("00")) p = `+${p.slice(2)}`;
  if (/^\d+$/.test(p)) {
    if (p.length === 10 && /^[6-9]/.test(p)) return `+91${p}`;
    if (p.length === 11 && p.startsWith("0")) return `+91${p.slice(1)}`;
    if (p.length === 12 && p.startsWith("91")) return `+${p}`;
    if (p.length >= 11 && p.length <= 15) return `+${p}`;
    return null;
  }
  if (/^\+\d{8,15}$/.test(p)) return p;
  return null;
}

function findContact(id: string) {
  const c = contacts.find((x) => x.id === id);
  if (!c) notFound("Contact");
  return c;
}

const callLogStore: CallLog[] = [
  {
    id: "cl1",
    contactId: contacts[3]?.id,
    contactName: contacts[3]?.name,
    phone: contacts[3]?.phone ?? "",
    direction: "outbound",
    durationSec: 342,
    note: "Walked through the catering proposal",
    at: new Date(Date.now() - 86400_000).toISOString(),
  },
  {
    id: "cl2",
    contactId: contacts[7]?.id,
    contactName: contacts[7]?.name,
    phone: contacts[7]?.phone ?? "",
    direction: "inbound",
    durationSec: 95,
    note: "Asked about bulk pricing",
    at: new Date(Date.now() - 3600_000 * 5).toISOString(),
  },
];

const businessHoursStore: BusinessHoursConfig = {
  enabled: true,
  timezone: "Asia/Kolkata",
  hours: [
    { day: 1, open: "09:00", close: "21:00" },
    { day: 2, open: "09:00", close: "21:00" },
    { day: 3, open: "09:00", close: "21:00" },
    { day: 4, open: "09:00", close: "21:00" },
    { day: 5, open: "09:00", close: "21:00" },
    { day: 6, open: "10:00", close: "18:00" },
  ],
};

const autoReplyStore: AutoReply[] = [
  {
    id: "ar1",
    name: "Welcome",
    trigger: "first_message",
    keywords: [],
    response: "Hi! Thanks for reaching out — how can we help?",
    active: true,
    createdAt: new Date(Date.now() - 86400_000 * 20).toISOString(),
    updatedAt: new Date(Date.now() - 86400_000 * 20).toISOString(),
  },
  {
    id: "ar2",
    name: "Pricing question",
    trigger: "keyword",
    keywords: ["price", "cost", "rate"],
    response: "Sure — our pricing starts at ₹499/month. Want me to send details?",
    active: true,
    createdAt: new Date(Date.now() - 86400_000 * 10).toISOString(),
    updatedAt: new Date(Date.now() - 86400_000 * 10).toISOString(),
  },
];

let openaiKey: { masked: string } | null = null;

const adStore: Ad[] = [
  {
    id: "ad1",
    name: "Diwali offer — WhatsApp",
    phone: "919876543210",
    message: "Hi! I'm interested in the Diwali offer.",
    active: true,
    clicks: 37,
    createdAt: new Date(Date.now() - 86400_000 * 6).toISOString(),
    updatedAt: new Date(Date.now() - 86400_000 * 6).toISOString(),
    waLink: "https://wa.me/919876543210?text=Hi!%20I'm%20interested%20in%20the%20Diwali%20offer.",
  },
];

function waLink(phone: string, message: string): string {
  const base = `https://wa.me/${phone.replace(/[^\d]/g, "")}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

function adView(a: Ad): Ad {
  return { ...a, waLink: waLink(a.phone, a.message) };
}

const webhookStore: WebhookEndpoint[] = [
  {
    id: "wh_ep1",
    url: "https://example.in/hooks/konvo",
    events: "message.created,conversation.assigned",
    active: true,
    hasSecret: true,
    deliveryCount: 128,
    createdAt: new Date(Date.now() - 86400_000 * 14).toISOString(),
    updatedAt: new Date(Date.now() - 86400_000 * 14).toISOString(),
  },
];

const apiKeyStore: ApiKey[] = [
  {
    id: "ak1",
    name: "Zapier sync",
    prefix: "kv_abc123def4",
    scopes: ["read"],
    lastUsedAt: new Date(Date.now() - 3600_000).toISOString(),
    revokedAt: null,
    createdAt: new Date(Date.now() - 86400_000 * 30).toISOString(),
  },
];

let totpEnabled = false;

function leadView(l: Lead): Lead {
  const contact = contacts.find((c) => c.id === l.contactId);
  const owner = users.find((u) => u.id === l.ownerId);
  return {
    ...l,
    contactName: contact?.name || contact?.phone || l.contactName,
    phone: contact?.phone ?? l.phone,
    ownerName: owner?.name ?? l.ownerName,
    createdAt: l.createdAt ?? l.updatedAt,
  };
}

function contactMatches(c: Contact, p?: ContactListParams): boolean {
  if (!p) return true;
  if (p.search) {
    const s = p.search.toLowerCase();
    const hit =
      c.name.toLowerCase().includes(s) ||
      c.phone.replace(/\s/g, "").includes(s.replace(/\s/g, "")) ||
      (c.email ?? "").toLowerCase().includes(s);
    if (!hit) return false;
  }
  if (p.tag && !c.tags.includes(p.tag)) return false;
  if (p.source && c.source !== p.source) return false;
  if (p.optedOut !== undefined && c.optedIn === p.optedOut) return false;
  if (p.groupId) {
    const g = groups.find((x) => x.id === p.groupId);
    if (g?.kind === "static") {
      if (!(groupMembers.get(g.id) ?? new Set()).has(c.id)) return false;
    }
    // dynamic group filtering is approximated by rule eval below
    if (g?.kind === "dynamic" && !evalRules(contactToEval(c), g.rules ?? [])) return false;
  }
  return true;
}

function contactToEval(c: Contact) {
  return {
    name: c.name,
    phone: c.phone,
    email: c.email ?? "",
    city: c.city,
    company: c.company ?? "",
    source: c.source ?? "",
    optedOut: !c.optedIn,
    lifetimeValue: c.lifetimeValue,
    lastSeenAt: c.lastSeenAt,
    tags: c.tags,
  };
}

function evalRules(c: ReturnType<typeof contactToEval>, rules: GroupRule[]): boolean {
  if (!rules.length) return false;
  const val = (f: string): string => {
    switch (f) {
      case "name":
        return c.name;
      case "phone":
        return c.phone;
      case "email":
        return c.email;
      case "city":
        return c.city;
      case "company":
        return c.company;
      case "source":
        return c.source;
      case "tags":
        return c.tags.join(",");
      case "optedIn":
        return c.optedOut ? "false" : "true";
      case "lifetimeValue":
        return String(c.lifetimeValue);
      case "lastSeen":
        return c.lastSeenAt;
      default:
        return "";
    }
  };
  const one = (r: GroupRule): boolean => {
    const a = val(r.field).toLowerCase();
    const e = r.value.toLowerCase();
    switch (r.operator) {
      case "equals":
        return a === e;
      case "not_equals":
        return a !== e;
      case "contains":
        return a.includes(e);
      case "not_contains":
        return !a.includes(e);
      case "greater_than":
        return Number(val(r.field)) > Number(r.value);
      case "less_than":
        return Number(val(r.field)) < Number(r.value);
      case "is_empty":
        return val(r.field).trim() === "";
      case "is_not_empty":
        return val(r.field).trim() !== "";
      default:
        return false;
    }
  };
  let res = one(rules[0]!);
  for (const r of rules.slice(1)) res = r.logic === "OR" ? res || one(r) : res && one(r);
  return res;
}

function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let field = "";
  let row: string[] = [];
  let inQ = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i]!;
    if (inQ) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
          continue;
        }
        inQ = false;
        continue;
      }
      field += ch;
      continue;
    }
    if (ch === '"') {
      inQ = true;
      continue;
    }
    if (ch === ",") {
      row.push(field);
      field = "";
      continue;
    }
    if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && text[i + 1] === "\n") i++;
      row.push(field);
      field = "";
      if (row.some((c) => c.trim() !== "")) rows.push(row);
      row = [];
      continue;
    }
    field += ch;
  }
  row.push(field);
  if (row.some((c) => c.trim() !== "")) rows.push(row);
  return rows;
}

function csvEscape(v: string | number | undefined): string {
  const s = v === undefined ? "" : String(v);
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

/* ---------- tags & groups stores ---------- */

const tagStore = new Map<string, Tag>();
function ensureTag(name: string): Tag {
  const key = name.toLowerCase();
  let t = [...tagStore.values()].find((x) => x.name.toLowerCase() === key);
  if (!t) {
    t = { id: `tag_${tagStore.size + 1}`, name, contactCount: 0 };
    tagStore.set(t.id, t);
  }
  return t;
}

const groups: ContactGroup[] = [
  {
    id: "grp_vip",
    name: "VIP Customers",
    kind: "dynamic",
    memberCount: 0,
    rules: [
      { field: "lifetimeValue", operator: "greater_than", value: "10000" },
      { field: "tags", operator: "contains", value: "VIP", logic: "AND" },
    ],
    createdAt: "2026-10-01T00:00:00.000Z",
  },
  {
    id: "grp_regulars",
    name: "Regulars",
    kind: "static",
    memberCount: 0,
    createdAt: "2026-10-05T00:00:00.000Z",
  },
];
const groupMembers = new Map<string, Set<string>>([
  ["grp_regulars", new Set(contacts.slice(0, 2).map((c) => c.id))],
]);

function groupMemberCount(g: ContactGroup): number {
  if (g.kind === "static") return groupMembers.get(g.id)?.size ?? 0;
  return contacts.filter((c) => evalRules(contactToEval(c), g.rules ?? [])).length;
}

function groupDetail(g: ContactGroup): GroupDetail {
  const ids =
    g.kind === "static"
      ? [...(groupMembers.get(g.id) ?? [])]
      : contacts.filter((c) => evalRules(contactToEval(c), g.rules ?? [])).map((c) => c.id);
  return {
    ...g,
    memberCount: ids.length,
    members: contacts
      .filter((c) => ids.includes(c.id))
      .map((c) => ({
        id: c.id,
        name: c.name,
        phone: c.phone,
        email: c.email,
        city: c.city,
        tags: c.tags,
        optedIn: c.optedIn,
      })),
  };
}

/* ---------- templates / broadcasts / campaigns ---------- */

function badRequest(code: string, message: string): never {
  throw new HttpError({ status: 400, code, message });
}

const templateStore: Template[] = db.templates.map((t) => ({
  ...t,
  createdAt: t.createdAt ?? new Date().toISOString(),
  updatedAt: t.updatedAt ?? new Date().toISOString(),
}));

let templateSeq = templateStore.length;

function findTemplate(id: string): Template {
  const t = templateStore.find((x) => x.id === id);
  if (!t) notFound("Template");
  return t;
}

const broadcastStore: Broadcast[] = db.broadcasts.map((b) => ({
  ...b,
  total: b.total ?? b.sent,
  createdAt: b.createdAt ?? new Date().toISOString(),
  updatedAt: b.updatedAt ?? new Date().toISOString(),
}));

let broadcastSeq = broadcastStore.length;

/** Per-broadcast recipient rows for broadcasts created through the mock API. */
const broadcastRecipients = new Map<string, BroadcastRecipient[]>();

const campaignStore: Campaign[] = [];
let campaignSeq = 0;

function audienceContacts(audience: string): Contact[] {
  if (audience === "opted-in") return contacts.filter((c) => c.optedIn);
  if (audience.startsWith("group:")) {
    const g = groups.find((x) => x.id === audience.slice(6));
    if (!g) return [];
    const ids =
      g.kind === "static"
        ? [...(groupMembers.get(g.id) ?? [])]
        : contacts.filter((c) => evalRules(contactToEval(c), g.rules ?? [])).map((c) => c.id);
    return contacts.filter((c) => ids.includes(c.id));
  }
  if (audience.startsWith("tag:")) {
    const name = decodeURIComponent(audience.slice(4));
    return contacts.filter((c) => c.tags.includes(name));
  }
  return contacts; // "all"
}

function audienceLabelFor(audience: string): string {
  if (audience === "all") return "All contacts";
  if (audience === "opted-in") return "Opted-in contacts";
  if (audience.startsWith("group:")) {
    const g = groups.find((x) => x.id === audience.slice(6));
    return g ? `Group: ${g.name}` : audience;
  }
  if (audience.startsWith("tag:")) return `Tag: ${decodeURIComponent(audience.slice(4))}`;
  return audience;
}

function recipientsFor(b: Broadcast): BroadcastRecipient[] {
  const stored = broadcastRecipients.get(b.id);
  if (stored) return stored;
  // Seeded broadcasts have no rows — synthesize a plausible log.
  const pool = contacts.slice(0, Math.max(b.sent, 1));
  return pool.map((c, i) => ({
    id: `${b.id}-r${i}`,
    contactId: c.id,
    contactName: c.name,
    phone: c.phone,
    status: i < b.read ? "read" : i < b.delivered ? "delivered" : "sent",
    sentAt: b.createdAt,
    deliveredAt: i < b.delivered ? b.createdAt : undefined,
    readAt: i < b.read ? b.createdAt : undefined,
  }));
}

function enrichBroadcast(b: Broadcast): Broadcast {
  const template = templateStore.find((t) => t.id === b.templateId);
  const recips = broadcastRecipients.get(b.id);
  const failed = recips?.filter((r) => r.status === "failed").length ?? 0;
  const skipped = recips?.filter((r) => r.status === "skipped").length ?? b.skipped ?? 0;
  return {
    ...b,
    templateName: template?.name,
    audienceLabel: b.audienceLabel ?? audienceLabelFor(b.audience),
    failed: b.failed ?? failed,
    skipped,
    total: b.total ?? recips?.length ?? b.sent,
  };
}

function findBroadcast(id: string): Broadcast {
  const b = broadcastStore.find((x) => x.id === id);
  if (!b) notFound("Broadcast");
  return b;
}

function snapshotRecipients(b: Broadcast): BroadcastRecipient[] {
  const rows = audienceContacts(b.audience).map((c) => ({
    id: `${b.id}-r-${c.id}`,
    contactId: c.id,
    contactName: c.name,
    phone: c.phone,
    status: (c.optedIn ? "pending" : "skipped") as BroadcastRecipientStatus,
  }));
  broadcastRecipients.set(b.id, rows);
  return rows;
}

function campaignWithStats(c: Campaign): Campaign {
  const bs = broadcastStore.filter((b) => b.campaignId === c.id);
  return {
    ...c,
    broadcastCount: bs.length,
    sent: bs.reduce((n, b) => n + b.sent, 0),
    delivered: bs.reduce((n, b) => n + b.delivered, 0),
    read: bs.reduce((n, b) => n + b.read, 0),
  };
}

function applyBroadcastSend(b: Broadcast) {
  const rows = broadcastRecipients.get(b.id) ?? snapshotRecipients(b);
  const sendable = rows.filter((r) => r.status === "pending");
  const now = new Date().toISOString();
  for (const r of sendable) {
    r.status = "sent";
    r.sentAt = now;
    if (Math.random() < 0.9) {
      r.status = "delivered";
      r.deliveredAt = now;
    }
    if (Math.random() < 0.6) {
      r.status = "read";
      r.readAt = now;
    }
  }
  const sent = rows.filter((r) => ["sent", "delivered", "read"].includes(r.status)).length;
  const delivered = rows.filter((r) => ["delivered", "read"].includes(r.status)).length;
  const read = rows.filter((r) => r.status === "read").length;
  b.status = "sent";
  b.sent = sent;
  b.delivered = delivered;
  b.read = read;
  b.total = rows.length;
}

function applyContactInput(c: Contact, input: Partial<CreateContactInput>) {
  if (input.name !== undefined) c.name = input.name;
  if (input.email !== undefined) c.email = input.email || undefined;
  if (input.company !== undefined) c.company = input.company;
  if (input.designation !== undefined) c.designation = input.designation;
  if (input.city !== undefined) c.city = input.city;
  if (input.tags !== undefined) c.tags = input.tags;
  if (input.optedOut !== undefined) c.optedIn = !input.optedOut;
  if (input.customFields !== undefined) c.customFields = input.customFields;
  if (input.notes !== undefined) c.notes = input.notes;
  if (input.source !== undefined) c.source = input.source;
}

function findConvo(id: string) {
  const c = db.conversations.find((x) => x.id === id);
  if (!c) notFound("Chat");
  return c;
}

export const mockApi: Api = {
  auth: {
    async login({ email, password }) {
      await latency();
      const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
      const expected = user ? passwords.get(user.email.toLowerCase()) : undefined;
      if (!user || expected !== password) {
        throw new HttpError({
          status: 401,
          code: "invalid_credentials",
          message: "That email and password don't match.",
        });
      }
      return { user: { ...user }, token: "mock-token" };
    },
    async register({ name, email, password, business, slug }) {
      await latency();
      if (takenSlugs.has(slug.toLowerCase())) {
        throw new HttpError({
          status: 409,
          code: "slug_taken",
          message: "This workspace URL is already taken.",
        });
      }
      takenSlugs.add(slug.toLowerCase());
      const user: User = {
        id: `u_${users.length + 1}`,
        name,
        email,
        avatarColor: users.length % 5,
        role: "owner",
        online: true,
      };
      users.push(user);
      passwords.set(email.toLowerCase(), password);
      void business;
      return { user, token: "mock-token" };
    },
    async forgotPassword() {
      await latency();
    },
    async checkSlug(slug) {
      await latency();
      return { available: !takenSlugs.has(slug.toLowerCase()) };
    },
  },
  workspaces: {
    async list() {
      await latency();
      return db.workspaces;
    },
    async get(id: ID) {
      await latency();
      const ws = db.workspaces.find((w) => w.id === id);
      if (!ws) throw new Error("Workspace not found");
      return { ...ws };
    },
    async update(id: ID, input: UpdateWorkspaceInput) {
      await latency();
      const ws = db.workspaces.find((w) => w.id === id);
      if (!ws) throw new Error("Workspace not found");
      Object.assign(ws, input);
      return { ...ws };
    },
  },
  contacts: {
    async list(p?: ContactListParams) {
      await latency();
      const rows = contacts.filter((c) => contactMatches(c, p));
      return paginate(rows, p);
    },
    async get(id) {
      await latency();
      return { ...findContact(id) };
    },
    async create(input: CreateContactInput) {
      await latency();
      const phone = normalizePhone(input.phone) ?? input.phone.trim();
      const existing = contacts.find((c) => c.phone === phone);
      if (existing) {
        applyContactInput(existing, input);
        if (input.tags) existing.tags = input.tags;
        return { ...existing };
      }
      const c: Contact = {
        id: `c_${contacts.length + 1}_${Date.now()}`,
        name: input.name ?? "",
        phone,
        email: input.email || undefined,
        city: input.city ?? "",
        tags: input.tags ?? [],
        optedIn: !(input.optedOut ?? false),
        lifetimeValue: 0,
        lastSeenAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        customFields: input.customFields ?? [],
        notes: input.notes ?? "",
        source: input.source ?? "manual",
        company: input.company,
        designation: input.designation,
        country: input.country ?? "IN",
        optedOut: input.optedOut ?? false,
      };
      contacts.push(c);
      if (input.createLead) {
        db.leads.push({
          id: `lead_${Date.now()}`,
          contactId: c.id,
          title: input.leadTitle ?? `New lead — ${c.name || c.phone}`,
          value: 0,
          stage: "new",
          ownerId: "u_1",
          updatedAt: new Date().toISOString(),
        });
      }
      return { ...c };
    },
    async update(id, input) {
      await latency();
      const c = findContact(id);
      applyContactInput(c, input);
      return { ...c };
    },
    async remove(id) {
      await latency();
      const i = contacts.findIndex((x) => x.id === id);
      if (i === -1) notFound("Contact");
      contacts.splice(i, 1);
    },
    async bulk(input) {
      await latency();
      const targets = contacts.filter((c) => input.ids.includes(c.id));
      switch (input.action) {
        case "addTags":
          for (const c of targets) c.tags = [...new Set([...c.tags, ...(input.tags ?? [])])];
          break;
        case "removeTags":
          for (const c of targets) c.tags = c.tags.filter((t) => !(input.tags ?? []).includes(t));
          break;
        case "setOptedOut":
          for (const c of targets) {
            c.optedIn = !(input.optedOut ?? true);
            c.optedOut = input.optedOut ?? true;
          }
          break;
        case "addToGroup": {
          const g = groups.find((x) => x.id === input.groupId);
          if (!g) notFound("Group");
          if (g.kind !== "static")
            throw new HttpError({ status: 400, code: "dynamic_group", message: "Dynamic group" });
          const set = groupMembers.get(g.id) ?? new Set<string>();
          for (const c of targets) set.add(c.id);
          groupMembers.set(g.id, set);
          break;
        }
        case "removeFromGroup": {
          const set = groupMembers.get(input.groupId ?? "");
          if (set) for (const c of targets) set.delete(c.id);
          break;
        }
        case "delete":
          for (const c of targets) contacts.splice(contacts.indexOf(c), 1);
          break;
      }
      return { affected: targets.length };
    },
    async importPreview(csv: string): Promise<ImportPreview> {
      await latency();
      const table = parseCsv(csv);
      if (table.length < 2) {
        throw new HttpError({
          status: 400,
          code: "empty_csv",
          message: "CSV needs a header and data rows",
        });
      }
      const headers = table[0]!.map((h) => h.trim().toLowerCase());
      const col = (names: string[]) => headers.findIndex((h) => names.includes(h));
      const idx = {
        name: col(["name", "full name", "fullname"]),
        phone: col(["phone", "phone number", "mobile", "contact", "whatsapp"]),
        email: col(["email", "e-mail", "email address"]),
        city: col(["city"]),
        company: col(["company", "business", "organization"]),
        tags: col(["tags", "tag", "labels"]),
        source: col(["source"]),
      };
      const cell = (row: string[], i: number) => (i >= 0 ? (row[i] ?? "").trim() : "");
      const seen = new Set<string>();
      const rows = table.slice(1).map((r, i) => {
        const rawPhone = cell(r, idx.phone);
        const phone = normalizePhone(rawPhone);
        const errors: string[] = [];
        let status: "new" | "duplicate" | "invalid" = "new";
        let existingId: string | undefined;
        if (!phone) {
          errors.push("Invalid or missing phone number");
          status = "invalid";
        } else if (seen.has(phone)) {
          errors.push("Duplicate phone within file");
          status = "duplicate";
        } else {
          seen.add(phone);
          const ex = contacts.find((c) => c.phone === phone);
          if (ex) {
            status = "duplicate";
            existingId = ex.id;
          }
        }
        return {
          index: i + 2,
          status,
          errors,
          ...(existingId ? { existingId } : {}),
          data: {
            name: cell(r, idx.name) || undefined,
            phone: phone ?? rawPhone,
            email: cell(r, idx.email) || undefined,
            city: cell(r, idx.city) || undefined,
            company: cell(r, idx.company) || undefined,
            tags: cell(r, idx.tags)
              ? cell(r, idx.tags)
                  .split(/[;,]/)
                  .map((t) => t.trim())
                  .filter(Boolean)
              : undefined,
            source: cell(r, idx.source) || "import",
          },
        };
      });
      return {
        rows,
        totals: {
          total: rows.length,
          new: rows.filter((r) => r.status === "new").length,
          duplicates: rows.filter((r) => r.status === "duplicate").length,
          invalid: rows.filter((r) => r.status === "invalid").length,
        },
      };
    },
    async importCommit(rows) {
      await latency();
      let created = 0;
      let updated = 0;
      for (const row of rows) {
        const phone = normalizePhone(row.phone) ?? row.phone.trim();
        const existing = contacts.find((c) => c.phone === phone);
        if (existing) {
          applyContactInput(existing, row);
          updated++;
        } else {
          await mockApi.contacts.create(row);
          created++;
        }
      }
      return { created, updated, skipped: 0 };
    },
    async exportCsv(p) {
      await latency();
      const rows = contacts.filter(
        (c) => contactMatches(c, p) && (!p?.ids || p.ids.includes(c.id)),
      );
      const header = "name,phone,email,city,company,tags,optedOut,source,lifetimeValue,createdAt";
      const lines = rows.map((c) =>
        [
          c.name,
          c.phone,
          c.email ?? "",
          c.city,
          c.company ?? "",
          c.tags.join(";"),
          c.optedIn ? "false" : "true",
          c.source ?? "",
          c.lifetimeValue,
          c.createdAt,
        ]
          .map(csvEscape)
          .join(","),
      );
      return [header, ...lines].join("\r\n") + "\r\n";
    },
    async updateNotes(id, notes) {
      await latency();
      const c = findContact(id);
      c.notes = notes;
      return { ...c };
    },
  },
  tags: {
    async list() {
      await latency();
      // Derive tags from contacts + explicit store
      const names = new Set<string>();
      for (const c of contacts) for (const t of c.tags) names.add(t);
      for (const t of tagStore.values()) names.add(t.name);
      return [...names].map((n) => {
        const t = ensureTag(n);
        return { ...t, contactCount: contacts.filter((c) => c.tags.includes(n)).length };
      });
    },
    async create(input) {
      await latency();
      const t = ensureTag(input.name);
      if (input.color) t.color = input.color;
      return { ...t };
    },
    async update(id, input) {
      await latency();
      const t = tagStore.get(id);
      if (!t) notFound("Tag");
      if (input.name) t.name = input.name;
      if (input.color) t.color = input.color;
      return { ...t };
    },
    async remove(id) {
      await latency();
      tagStore.delete(id);
    },
  },
  groups: {
    async list() {
      await latency();
      return groups.map((g) => ({ ...g, memberCount: groupMemberCount(g), rules: g.rules }));
    },
    async get(id) {
      await latency();
      const g = groups.find((x) => x.id === id);
      if (!g) notFound("Group");
      return groupDetail(g);
    },
    async create(input) {
      await latency();
      const g: ContactGroup = {
        id: `grp_${Date.now()}`,
        name: input.name,
        kind: input.kind ?? "static",
        memberCount: 0,
        ...(input.rules ? { rules: input.rules } : {}),
        createdAt: new Date().toISOString(),
      };
      groups.push(g);
      if (g.kind === "static") groupMembers.set(g.id, new Set());
      return { ...g, memberCount: 0 };
    },
    async update(id, input) {
      await latency();
      const g = groups.find((x) => x.id === id);
      if (!g) notFound("Group");
      if (input.name) g.name = input.name;
      if (input.kind) g.kind = input.kind;
      if (input.rules) g.rules = input.rules;
      return { ...g, memberCount: groupMemberCount(g) };
    },
    async remove(id) {
      await latency();
      const i = groups.findIndex((x) => x.id === id);
      if (i === -1) notFound("Group");
      groups.splice(i, 1);
      groupMembers.delete(id);
    },
    async addMembers(id, contactIds) {
      await latency();
      const g = groups.find((x) => x.id === id);
      if (!g) notFound("Group");
      if (g.kind !== "static") forbidden();
      const set = groupMembers.get(id) ?? new Set<string>();
      for (const cid of contactIds) if (contacts.some((c) => c.id === cid)) set.add(cid);
      groupMembers.set(id, set);
      return { added: contactIds.length, memberCount: set.size };
    },
    async removeMembers(id, contactIds) {
      await latency();
      const set = groupMembers.get(id);
      if (!set) notFound("Group");
      for (const cid of contactIds) set.delete(cid);
      return { removed: contactIds.length, memberCount: set.size };
    },
  },
  conversations: {
    async list(p) {
      await latency();
      const rows = db.conversations.filter(
        (c) =>
          matches(c, p?.search) &&
          (!p?.assigneeId || c.assigneeId === p.assigneeId) &&
          (!p?.status || c.status === p.status) &&
          (!p?.tag || c.tags.includes(p.tag)) &&
          (!p?.channel || c.channel === p.channel) &&
          (!p?.tab ||
            p.tab === "all" ||
            (p.tab === "unassigned" && !c.assigneeId) ||
            (p.tab === "mine" && c.assigneeId === p.viewerId)),
      );
      return paginate(rows, p);
    },
    async get(id) {
      await latency();
      return { ...findConvo(id) };
    },
    async messages(id) {
      await latency();
      findConvo(id);
      return messages.get(id) ?? [];
    },
    async send(id, input) {
      await latency();
      const c = findConvo(id);
      const msg: Message = {
        id: `${id}-m${(messages.get(id)?.length ?? 0) + 1}`,
        conversationId: id,
        direction: "out",
        kind: input.kind,
        body: input.body,
        sentAt: new Date().toISOString(),
        status: "sent",
        ...(input.replyToId !== undefined ? { replyToId: input.replyToId } : {}),
        ...(input.fileName !== undefined ? { fileName: input.fileName } : {}),
        ...(input.templateId !== undefined ? { templateName: input.templateId } : {}),
      };
      const list = messages.get(id) ?? [];
      list.push(msg);
      messages.set(id, list);
      c.lastMessage = input.body;
      c.lastMessageAt = msg.sentAt;
      for (const l of inboxListeners) l({ type: "message", conversationId: id, message: msg });
      return msg;
    },
    async assign(id, assigneeId) {
      await latency();
      const c = findConvo(id);
      if (assigneeId === null) delete c.assigneeId;
      else c.assigneeId = assigneeId;
      return { ...c };
    },
    async setStatus(id, status) {
      await latency();
      const c = findConvo(id);
      c.status = status;
      return { ...c };
    },
    async snooze(id, until) {
      await latency();
      const c = findConvo(id);
      c.snoozedUntil = until;
      return { ...c };
    },
    async transfer(id, teamId) {
      await latency();
      const c = findConvo(id);
      c.teamId = teamId;
      return { ...c };
    },
    async markRead(id) {
      await latency();
      const c = findConvo(id);
      c.unread = 0;
      return { ...c };
    },
    async quickReplies() {
      await latency();
      return db.quickReplies;
    },
    subscribe(listener) {
      inboxListeners.add(listener);
      return () => {
        inboxListeners.delete(listener);
      };
    },
  },
  templates: {
    async list(p) {
      await latency();
      return templateStore
        .filter(
          (t) =>
            (!p?.status || t.status === p.status) &&
            (!p?.search || t.name.toLowerCase().includes(p.search.toLowerCase())),
        )
        .map((t) => ({ ...t }));
    },
    async get(id) {
      await latency();
      return { ...findTemplate(id) };
    },
    async create(input: CreateTemplateInput) {
      await latency();
      if (!/^[a-z0-9_]+$/.test(input.name)) {
        badRequest(
          "validation_error",
          "Template name may only contain lowercase letters, numbers and underscores",
        );
      }
      if (
        templateStore.some((t) => t.name === input.name && t.language === (input.language ?? "en"))
      ) {
        badRequest("template_exists", "A template with this name and language already exists");
      }
      const t: Template = {
        id: `tpl_${++templateSeq}`,
        name: input.name,
        category: input.category ?? "Utility",
        language: input.language ?? "en",
        status: "draft",
        body: input.body,
        headerMedia: input.headerMedia,
        buttons: input.buttons,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      templateStore.unshift(t);
      return { ...t };
    },
    async update(id, input: UpdateTemplateInput) {
      await latency();
      const t = findTemplate(id);
      if (t.status === "pending" || t.status === "approved") {
        badRequest("template_locked", `Cannot edit a ${t.status} template`);
      }
      if (input.name !== undefined) t.name = input.name;
      if (input.category !== undefined) t.category = input.category;
      if (input.language !== undefined) t.language = input.language;
      if (input.body !== undefined) t.body = input.body;
      if (input.headerMedia !== undefined) t.headerMedia = input.headerMedia;
      if (input.buttons !== undefined) t.buttons = input.buttons;
      if (t.status === "rejected") {
        t.status = "draft";
        t.rejectionReason = undefined;
      }
      t.updatedAt = new Date().toISOString();
      return { ...t };
    },
    async remove(id) {
      await latency();
      const idx = templateStore.findIndex((t) => t.id === id);
      if (idx === -1) notFound("Template");
      if (broadcastStore.some((b) => b.templateId === id)) {
        badRequest("template_in_use", "Template is used by one or more broadcasts");
      }
      templateStore.splice(idx, 1);
    },
    async submit(id) {
      await latency();
      const t = findTemplate(id);
      if (t.status !== "draft" && t.status !== "rejected") {
        badRequest("invalid_state", `Cannot submit a ${t.status} template`);
      }
      t.status = "pending";
      t.rejectionReason = undefined;
      t.updatedAt = new Date().toISOString();
      return { ...t };
    },
    async approve(id) {
      await latency();
      const t = findTemplate(id);
      if (t.status !== "pending")
        badRequest("invalid_state", `Cannot approve a ${t.status} template`);
      t.status = "approved";
      t.updatedAt = new Date().toISOString();
      return { ...t };
    },
    async reject(id, reason) {
      await latency();
      const t = findTemplate(id);
      if (t.status !== "pending")
        badRequest("invalid_state", `Cannot reject a ${t.status} template`);
      t.status = "rejected";
      t.rejectionReason = reason;
      t.updatedAt = new Date().toISOString();
      return { ...t };
    },
  },
  broadcasts: {
    async list(p?: BroadcastListParams) {
      await latency();
      return broadcastStore
        .filter(
          (b) =>
            (!p?.status || b.status === p.status) &&
            (!p?.campaignId || b.campaignId === p.campaignId) &&
            (!p?.search || b.name.toLowerCase().includes(p.search.toLowerCase())),
        )
        .map(enrichBroadcast);
    },
    async get(id) {
      await latency();
      return enrichBroadcast(findBroadcast(id));
    },
    async recipients(id, p) {
      await latency();
      findBroadcast(id);
      let rows = recipientsFor(findBroadcast(id));
      if (p?.status) rows = rows.filter((r) => r.status === p.status);
      return paginate(rows, p ?? {});
    },
    async create(input: CreateBroadcastInput) {
      await latency();
      const template = findTemplate(input.templateId);
      if (template.status !== "approved") {
        badRequest("template_not_approved", "Broadcasts require an approved template");
      }
      const audience =
        input.audience === "all" ||
        input.audience === "opted-in" ||
        input.audience.startsWith("group:") ||
        input.audience.startsWith("tag:")
          ? input.audience
          : badRequest("invalid_audience", "Invalid audience");
      const scheduled = input.scheduledAt ? new Date(input.scheduledAt) : null;
      const b: Broadcast = {
        id: `bc_${++broadcastSeq}`,
        name: input.name,
        templateId: input.templateId,
        audience,
        status: scheduled ? "scheduled" : "draft",
        sent: 0,
        delivered: 0,
        read: 0,
        scheduledAt: scheduled?.toISOString(),
        campaignId: input.campaignId,
        channelAccountId: input.channelAccountId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      broadcastStore.unshift(b);
      snapshotRecipients(b);
      if (!scheduled) applyBroadcastSend(b);
      return enrichBroadcast(b);
    },
    async update(id, input: UpdateBroadcastInput) {
      await latency();
      const b = findBroadcast(id);
      if (b.status !== "draft" && b.status !== "scheduled") {
        badRequest("invalid_state", `Cannot edit a ${b.status} broadcast`);
      }
      if (input.name !== undefined) b.name = input.name;
      if (input.audience !== undefined) {
        b.audience = input.audience;
        broadcastRecipients.delete(b.id);
        snapshotRecipients(b);
      }
      if (input.campaignId !== undefined) b.campaignId = input.campaignId ?? undefined;
      if (input.channelAccountId !== undefined)
        b.channelAccountId = input.channelAccountId ?? undefined;
      if (input.scheduledAt !== undefined) {
        b.scheduledAt = input.scheduledAt ?? undefined;
        b.status = b.scheduledAt ? "scheduled" : "draft";
      }
      b.updatedAt = new Date().toISOString();
      return enrichBroadcast(b);
    },
    async send(id) {
      await latency();
      const b = findBroadcast(id);
      if (b.status !== "draft" && b.status !== "scheduled") {
        badRequest("invalid_state", `Cannot send a ${b.status} broadcast`);
      }
      applyBroadcastSend(b);
      b.updatedAt = new Date().toISOString();
      return enrichBroadcast(b);
    },
    async cancel(id) {
      await latency();
      const b = findBroadcast(id);
      if (["sent", "cancelled", "failed"].includes(b.status)) {
        badRequest("invalid_state", `Cannot cancel a ${b.status} broadcast`);
      }
      for (const r of broadcastRecipients.get(b.id) ?? []) {
        if (r.status === "pending" || r.status === "queued") r.status = "skipped";
      }
      b.status = "cancelled";
      b.updatedAt = new Date().toISOString();
      return enrichBroadcast(b);
    },
    async remove(id) {
      await latency();
      const b = findBroadcast(id);
      if (!["draft", "scheduled", "cancelled"].includes(b.status)) {
        badRequest("invalid_state", `Cannot delete a ${b.status} broadcast`);
      }
      const idx = broadcastStore.findIndex((x) => x.id === id);
      broadcastStore.splice(idx, 1);
      broadcastRecipients.delete(id);
    },
  },
  campaigns: {
    async list(p) {
      await latency();
      return campaignStore
        .filter(
          (c) =>
            (!p?.status || c.status === p.status) &&
            (!p?.search || c.name.toLowerCase().includes(p.search.toLowerCase())),
        )
        .map(campaignWithStats);
    },
    async get(id): Promise<CampaignDetail> {
      await latency();
      const c = campaignStore.find((x) => x.id === id);
      if (!c) notFound("Campaign");
      return {
        ...campaignWithStats(c),
        broadcasts: broadcastStore
          .filter((b) => b.campaignId === id)
          .map((b) => ({
            id: b.id,
            name: b.name,
            templateId: b.templateId,
            templateName: templateStore.find((t) => t.id === b.templateId)?.name,
            audience: b.audience,
            status: b.status,
            sent: b.sent,
            delivered: b.delivered,
            read: b.read,
            scheduledAt: b.scheduledAt,
            createdAt: b.createdAt ?? new Date().toISOString(),
          })),
      };
    },
    async create(input: CreateCampaignInput) {
      await latency();
      const c: Campaign = {
        id: `camp_${++campaignSeq}`,
        name: input.name,
        description: input.description ?? "",
        status: "draft",
        broadcastCount: 0,
        sent: 0,
        delivered: 0,
        read: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      campaignStore.unshift(c);
      return { ...c };
    },
    async update(id, input: UpdateCampaignInput) {
      await latency();
      const c = campaignStore.find((x) => x.id === id);
      if (!c) notFound("Campaign");
      if (input.name !== undefined) c.name = input.name;
      if (input.description !== undefined) c.description = input.description;
      if (input.status !== undefined) c.status = input.status as CampaignStatus;
      c.updatedAt = new Date().toISOString();
      return campaignWithStats(c);
    },
    async remove(id) {
      await latency();
      const idx = campaignStore.findIndex((x) => x.id === id);
      if (idx === -1) notFound("Campaign");
      campaignStore.splice(idx, 1);
      for (const b of broadcastStore) {
        if (b.campaignId === id) b.campaignId = undefined;
      }
    },
  },
  leads: {
    async list(p?: LeadListParams) {
      await latency();
      const rows = db.leads.filter((l) => {
        if (p?.stage && l.stage !== p.stage) return false;
        if (p?.ownerId && l.ownerId !== p.ownerId) return false;
        if (p?.search) {
          const s = p.search.toLowerCase();
          const view = leadView(l);
          const hit =
            l.title.toLowerCase().includes(s) ||
            (view.contactName ?? "").toLowerCase().includes(s) ||
            (view.phone ?? "").includes(s);
          if (!hit) return false;
        }
        return true;
      });
      return paginate(rows.map(leadView), p);
    },
    async get(id) {
      await latency();
      const l = db.leads.find((x) => x.id === id);
      if (!l) notFound("Lead");
      return leadView(l);
    },
    async create(input: CreateLeadInput) {
      await latency();
      const contact = contacts.find((c) => c.id === input.contactId);
      if (!contact) notFound("Contact");
      const lead: Lead = {
        id: `l_${Date.now()}`,
        contactId: input.contactId,
        title: input.title,
        value: input.value ?? 0,
        stage: input.stage ?? "new",
        ownerId: input.ownerId ?? "u1",
        updatedAt: new Date().toISOString(),
      };
      db.leads.push(lead);
      return leadView(lead);
    },
    async update(id, input: UpdateLeadInput) {
      await latency();
      const l = db.leads.find((x) => x.id === id);
      if (!l) notFound("Lead");
      if (input.contactId !== undefined) {
        if (!contacts.some((c) => c.id === input.contactId)) notFound("Contact");
        l.contactId = input.contactId;
      }
      if (input.title !== undefined) l.title = input.title;
      if (input.value !== undefined) l.value = input.value;
      if (input.stage !== undefined) l.stage = input.stage;
      if (input.ownerId !== undefined) l.ownerId = input.ownerId;
      l.updatedAt = new Date().toISOString();
      return leadView(l);
    },
    async remove(id) {
      await latency();
      const i = db.leads.findIndex((x) => x.id === id);
      if (i === -1) notFound("Lead");
      db.leads.splice(i, 1);
    },
  },
  calls: {
    async logs(p) {
      await latency();
      const rows = callLogStore.filter((l) => {
        if (p?.direction && l.direction !== p.direction) return false;
        if (p?.search) {
          const s = p.search.toLowerCase();
          const hit =
            l.phone.includes(p.search.replace(/\s/g, "")) ||
            (l.contactName ?? "").toLowerCase().includes(s) ||
            (l.note ?? "").toLowerCase().includes(s);
          if (!hit) return false;
        }
        return true;
      });
      return paginate(rows, p);
    },
    async log(input: CreateCallLogInput) {
      await latency();
      const contact = input.contactId ? contacts.find((c) => c.id === input.contactId) : undefined;
      const entry: CallLog = {
        id: `cl_${Date.now()}`,
        ...(input.contactId ? { contactId: input.contactId } : {}),
        ...(contact ? { contactName: contact.name, phone: contact.phone } : { phone: input.phone }),
        ...(input.direction ? { direction: input.direction } : {}),
        ...(input.durationSec !== undefined ? { durationSec: input.durationSec } : {}),
        ...(input.note ? { note: input.note } : {}),
        ...(input.recordingUrl ? { recordingUrl: input.recordingUrl } : {}),
        at: input.at ?? new Date().toISOString(),
      };
      callLogStore.unshift(entry);
      return entry;
    },
    async removeLog(id) {
      await latency();
      const i = callLogStore.findIndex((x) => x.id === id);
      if (i === -1) notFound("Call log");
      callLogStore.splice(i, 1);
    },
    async reminders(p) {
      await latency();
      const rows = db.callReminders.filter((r) => {
        if (p?.includeDone !== true && r.done) return false;
        if (p?.upcoming && new Date(r.at).getTime() < Date.now()) return false;
        return true;
      });
      return rows.map((r) => ({ ...r, done: r.done ?? false }));
    },
    async addReminder(input: CreateCallReminderInput) {
      await latency();
      const reminder: CallReminder = {
        id: `cr_${Date.now()}`,
        ...(input.contactId ? { contactId: input.contactId } : {}),
        contactName: input.contactName,
        phone: input.phone,
        note: input.note ?? "",
        at: input.at,
        done: false,
        createdAt: new Date().toISOString(),
      };
      db.callReminders.unshift(reminder);
      return reminder;
    },
    async updateReminder(id, input: UpdateCallReminderInput) {
      await latency();
      const r = db.callReminders.find((x) => x.id === id);
      if (!r) notFound("Reminder");
      if (input.contactName !== undefined) r.contactName = input.contactName;
      if (input.phone !== undefined) r.phone = input.phone;
      if (input.note !== undefined) r.note = input.note;
      if (input.at !== undefined) r.at = input.at;
      if (input.done !== undefined) r.done = input.done;
      return { ...r, done: r.done ?? false };
    },
    async removeReminder(id) {
      await latency();
      const i = db.callReminders.findIndex((x) => x.id === id);
      if (i === -1) notFound("Reminder");
      db.callReminders.splice(i, 1);
    },
  },
  analytics: {
    async overview(days = 30): Promise<AnalyticsOverview> {
      await latency();
      const since = Date.now() - days * 86400_000;
      const allMessages = [...messages.values()].flat();
      const inRange = allMessages.filter((m) => new Date(m.sentAt).getTime() >= since);
      const byDay = new Map<string, { incoming: number; outgoing: number }>();
      for (const m of inRange) {
        const day = m.sentAt.slice(0, 10);
        const cur = byDay.get(day) ?? { incoming: 0, outgoing: 0 };
        if (m.direction === "in") cur.incoming++;
        else cur.outgoing++;
        byDay.set(day, cur);
      }
      const statusCounts = new Map<string, number>();
      const channelCounts = new Map<string, { conversations: number; messages: number }>();
      for (const c of db.conversations) {
        statusCounts.set(c.status, (statusCounts.get(c.status) ?? 0) + 1);
        const ch = channelCounts.get(c.channel) ?? { conversations: 0, messages: 0 };
        ch.conversations++;
        ch.messages += messages.get(c.id)?.length ?? 0;
        channelCounts.set(c.channel, ch);
      }
      const stageCounts = new Map<string, { count: number; value: number }>();
      for (const l of db.leads) {
        const cur = stageCounts.get(l.stage) ?? { count: 0, value: 0 };
        cur.count++;
        cur.value += l.value;
        stageCounts.set(l.stage, cur);
      }
      const agentCounts = new Map<string, number>();
      for (const m of inRange) {
        if (m.direction === "out" && m.authorId) {
          agentCounts.set(m.authorId, (agentCounts.get(m.authorId) ?? 0) + 1);
        }
      }
      const topAgents = [...agentCounts.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([userId, replies]) => ({
          userId,
          name: users.find((u) => u.id === userId)?.name ?? "Agent",
          replies,
        }));
      return {
        days,
        totals: {
          contacts: contacts.length,
          conversations: db.conversations.length,
          leads: db.leads.length,
          wonValue: db.leads.filter((l) => l.stage === "won").reduce((s, l) => s + l.value, 0),
          messagesIn: inRange.filter((m) => m.direction === "in").length,
          messagesOut: inRange.filter((m) => m.direction === "out").length,
        },
        conversationsByStatus: [...statusCounts.entries()].map(([status, count]) => ({
          status: status as AnalyticsOverview["conversationsByStatus"][number]["status"],
          count,
        })),
        leadsByStage: [...stageCounts.entries()].map(([stage, v]) => ({
          stage: stage as AnalyticsOverview["leadsByStage"][number]["stage"],
          count: v.count,
          value: v.value,
        })),
        channelBreakdown: [...channelCounts.entries()].map(([channel, v]) => ({
          channel: channel as AnalyticsOverview["channelBreakdown"][number]["channel"],
          conversations: v.conversations,
          messages: v.messages,
        })),
        topAgents,
        messagesByDay: [...byDay.entries()]
          .sort((a, b) => a[0].localeCompare(b[0]))
          .map(([date, v]) => ({ date, incoming: v.incoming, outgoing: v.outgoing })),
      };
    },
  },
  ads: {
    async list() {
      await latency();
      return adStore.map(adView);
    },
    async create(input: CreateAdInput) {
      await latency();
      const now = new Date().toISOString();
      const ad: Ad = {
        id: `ad_${Date.now()}`,
        name: input.name,
        phone: input.phone.replace(/[^\d]/g, ""),
        message: input.message ?? "",
        active: input.active ?? true,
        clicks: 0,
        createdAt: now,
        updatedAt: now,
        waLink: "",
      };
      adStore.unshift(ad);
      return adView(ad);
    },
    async update(id, input: UpdateAdInput) {
      await latency();
      const a = adStore.find((x) => x.id === id);
      if (!a) notFound("Ad");
      if (input.name !== undefined) a.name = input.name;
      if (input.phone !== undefined) a.phone = input.phone.replace(/[^\d]/g, "");
      if (input.message !== undefined) a.message = input.message;
      if (input.active !== undefined) a.active = input.active;
      a.updatedAt = new Date().toISOString();
      return adView(a);
    },
    async remove(id) {
      await latency();
      const i = adStore.findIndex((x) => x.id === id);
      if (i === -1) notFound("Ad");
      adStore.splice(i, 1);
    },
  },
  webhookEndpoints: {
    async list() {
      await latency();
      return webhookStore.map((w) => ({ ...w }));
    },
    async create(input) {
      await latency();
      const now = new Date().toISOString();
      const hook: WebhookEndpoint = {
        id: `wh_${Date.now()}`,
        url: input.url,
        events: input.events.join(","),
        active: input.active ?? true,
        hasSecret: true,
        deliveryCount: 0,
        createdAt: now,
        updatedAt: now,
      };
      webhookStore.unshift(hook);
      return { ...hook, secret: `whsec_${Math.random().toString(36).slice(2, 18)}` };
    },
    async update(id, input) {
      await latency();
      const w = webhookStore.find((x) => x.id === id);
      if (!w) notFound("Webhook");
      if (input.url !== undefined) w.url = input.url;
      if (input.events !== undefined) w.events = input.events.join(",");
      if (input.active !== undefined) w.active = input.active;
      w.updatedAt = new Date().toISOString();
      return { ...w };
    },
    async remove(id) {
      await latency();
      const i = webhookStore.findIndex((x) => x.id === id);
      if (i === -1) notFound("Webhook");
      webhookStore.splice(i, 1);
    },
    async rotateSecret(id) {
      await latency();
      const w = webhookStore.find((x) => x.id === id);
      if (!w) notFound("Webhook");
      return { secret: `whsec_${Math.random().toString(36).slice(2, 18)}` };
    },
    async test(id) {
      await latency();
      const w = webhookStore.find((x) => x.id === id);
      if (!w) notFound("Webhook");
      w.deliveryCount += 1;
      return { deliveryId: `del_${Date.now()}` };
    },
    async deliveries() {
      await latency();
      return [
        {
          id: "del1",
          event: "message.created",
          status: 200,
          attempts: 1,
          deliveredAt: new Date().toISOString(),
          lastError: null,
          createdAt: new Date().toISOString(),
        },
      ];
    },
  },
  apiKeys: {
    async list() {
      await latency();
      return apiKeyStore.map((k) => ({ ...k, scopes: [...k.scopes] }));
    },
    async create(input) {
      await latency();
      const key = `kv_mock${Math.random().toString(36).slice(2, 14)}`;
      const rec: ApiKey = {
        id: `ak_${Date.now()}`,
        name: input.name,
        prefix: key.slice(0, 12),
        scopes: input.scopes ?? ["read"],
        lastUsedAt: null,
        revokedAt: null,
        createdAt: new Date().toISOString(),
      };
      apiKeyStore.unshift(rec);
      return { ...rec, key };
    },
    async revoke(id) {
      await latency();
      const k = apiKeyStore.find((x) => x.id === id);
      if (!k) notFound("API key");
      k.revokedAt = new Date().toISOString();
      return { ...k };
    },
    async remove(id) {
      await latency();
      const i = apiKeyStore.findIndex((x) => x.id === id);
      if (i === -1) notFound("API key");
      apiKeyStore.splice(i, 1);
    },
  },
  security: {
    async totpStatus() {
      await latency();
      return { enabled: totpEnabled };
    },
    async totpSetup() {
      await latency();
      return {
        secret: "JBSWY3DPEHPK3PXP",
        otpauthUrl: "otpauth://totp/Konvo:user%40demo.in?secret=JBSWY3DPEHPK3PXP",
      };
    },
    async totpEnable(code) {
      await latency();
      if (code !== "123456") badRequest("invalid_code", "Invalid code");
      totpEnabled = true;
      return { enabled: true };
    },
    async totpDisable(code) {
      await latency();
      if (code !== "123456") badRequest("invalid_code", "Invalid code");
      totpEnabled = false;
      return { enabled: false };
    },
    async changePassword() {
      await latency();
      return { ok: true };
    },
  },
  automation: {
    async businessHours() {
      await latency();
      return { ...businessHoursStore, hours: businessHoursStore.hours.map((h) => ({ ...h })) };
    },
    async updateBusinessHours(input: BusinessHoursConfig) {
      await latency();
      businessHoursStore.enabled = input.enabled;
      businessHoursStore.timezone = input.timezone;
      businessHoursStore.hours = input.hours.map((h) => ({ ...h }));
      return { ...businessHoursStore, hours: businessHoursStore.hours.map((h) => ({ ...h })) };
    },
    async autoReplies() {
      await latency();
      return autoReplyStore.map((r) => ({ ...r, keywords: [...r.keywords] }));
    },
    async createAutoReply(input: CreateAutoReplyInput) {
      await latency();
      const now = new Date().toISOString();
      const rule: AutoReply = {
        id: `ar_${Date.now()}`,
        name: input.name ?? "",
        trigger: input.trigger,
        keywords: input.keywords ?? [],
        response: input.response,
        active: input.active ?? true,
        createdAt: now,
        updatedAt: now,
      };
      autoReplyStore.push(rule);
      return { ...rule };
    },
    async updateAutoReply(id, input: UpdateAutoReplyInput) {
      await latency();
      const r = autoReplyStore.find((x) => x.id === id);
      if (!r) notFound("Auto-reply");
      if (input.name !== undefined) r.name = input.name;
      if (input.trigger !== undefined) r.trigger = input.trigger;
      if (input.keywords !== undefined) r.keywords = input.keywords;
      if (input.response !== undefined) r.response = input.response;
      if (input.active !== undefined) r.active = input.active;
      r.updatedAt = new Date().toISOString();
      return { ...r };
    },
    async removeAutoReply(id) {
      await latency();
      const i = autoReplyStore.findIndex((x) => x.id === id);
      if (i === -1) notFound("Auto-reply");
      autoReplyStore.splice(i, 1);
    },
  },
  bots: {
    async list() {
      await latency();
      return db.bots.map((b) => ({
        ...b,
        trigger: {
          ...b.trigger,
          keywords: b.trigger.keywords ? [...b.trigger.keywords] : undefined,
        },
      }));
    },
    async create(input: CreateBotInput) {
      await latency();
      const bot = {
        id: `bt_${Date.now()}`,
        name: input.name,
        trigger: {
          ...input.trigger,
          keywords: input.trigger.keywords ? [...input.trigger.keywords] : undefined,
        },
        active: input.active ?? true,
        runs: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      db.bots.push(bot);
      return { ...bot };
    },
    async update(id, input: UpdateBotInput) {
      await latency();
      const b = db.bots.find((x) => x.id === id);
      if (!b) notFound("Bot");
      if (input.name !== undefined) b.name = input.name;
      if (input.trigger !== undefined) b.trigger = { ...input.trigger };
      if (input.active !== undefined) b.active = input.active;
      return { ...b, trigger: { ...b.trigger } };
    },
    async remove(id) {
      await latency();
      const i = db.bots.findIndex((x) => x.id === id);
      if (i === -1) notFound("Bot");
      db.bots.splice(i, 1);
    },
  },
  team: {
    async list() {
      await latency();
      return users.map((u) => ({ ...u }));
    },
    async teams() {
      await latency();
      return db.teams;
    },
  },
  dashboard: {
    async stats() {
      await latency();
      return {
        openConversations: {
          value: db.conversations.filter((c) => c.status === "open").length,
          trend: [4, 6, 5, 8, 7, 9, 7],
          delta: 12,
        },
        avgResponseMins: {
          value: 3.4,
          trend: [6, 5.5, 5, 4.8, 4.1, 3.9, 3.4],
          delta: -18,
        },
        newLeads: {
          value: db.leads.filter((l) => l.stage === "new").length + 9,
          trend: [3, 5, 4, 6, 8, 7, 11],
          delta: 22,
        },
        messagesToday: {
          value: 1286,
          trend: [820, 940, 1010, 980, 1120, 1190, 1286],
          delta: 8,
        },
      };
    },
    async activity() {
      await latency();
      return db.activity;
    },
    async callReminders() {
      await latency();
      return db.callReminders;
    },
    async onboarding() {
      await latency();
      return [
        { id: "connect" as const, done: true },
        { id: "import" as const, done: true },
        { id: "template" as const, done: false },
        { id: "invite" as const, done: false },
        { id: "broadcast" as const, done: false },
      ];
    },
  },
  integrations: {
    async saveOpenAiKey(key) {
      await latency();
      openaiKey = { masked: `sk-...${key.slice(-4)}` };
      return { masked: openaiKey.masked };
    },
    async openaiStatus() {
      await latency();
      return { configured: !!openaiKey, masked: openaiKey?.masked ?? null };
    },
    async removeOpenAiKey() {
      await latency();
      openaiKey = null;
    },
    async testOpenAi() {
      await latency();
      return openaiKey ? { ok: true } : { ok: false, error: "No OpenAI key configured" };
    },
    async suggestReplies() {
      await latency();
      return {
        suggestions: [
          "Thanks for reaching out! How can I help you today?",
          "Happy to help — could you share a bit more detail?",
          "Got it, let me check and get back to you shortly.",
        ],
      };
    },
  },
  inboxes: {
    async list() {
      await latency();
      return {
        supported: ["telegram", "web", "whatsapp"] as Channel[],
        items: inboxStore.map((i) => ({ ...i })),
      };
    },
    async get(id) {
      await latency();
      const inbox = inboxStore.find((i) => i.id === id);
      if (!inbox) notFound("Inbox");
      return {
        ...inbox,
        webhookPath: `/api/webhooks/${inbox.type}/${inbox.id}`,
        ...(inbox.type === "web" ? { widgetToken: "mock-widget-token" } : {}),
        ...(inbox.type === "telegram" ? { webhookSecret: "mock-webhook-secret" } : {}),
        ...(inbox.type === "whatsapp" ? { verifyToken: "mock-verify-token" } : {}),
      };
    },
    async connect(input: ConnectInboxInput) {
      await latency();
      if (input.type === "telegram" && !input.botToken.trim()) {
        throw new HttpError({
          status: 400,
          code: "telegram_error",
          message: "Invalid bot token",
        });
      }
      if (input.type === "web" && !input.name.trim()) {
        throw new HttpError({
          status: 400,
          code: "validation_error",
          message: "Name is required",
        });
      }
      const inbox: Inbox = {
        id: `inbox_${input.type}_${Date.now()}`,
        name:
          input.type === "web"
            ? input.name
            : input.type === "telegram"
              ? (input.name ?? "Telegram bot")
              : "WhatsApp Business",
        type: input.type,
        status: "connected",
        ...(input.type === "whatsapp"
          ? { phoneNumber: "+91 98765 43210", qualityRating: "High", messagingTier: "Tier 2" }
          : {}),
        webhookVerified: true,
        autoAssign: true,
        createdAt: new Date().toISOString(),
      };
      inboxStore.push(inbox);
      return { ...inbox };
    },
    async update(id, input) {
      await latency();
      const inbox = inboxStore.find((i) => i.id === id);
      if (!inbox) notFound("Inbox");
      if (input.name !== undefined) inbox.name = input.name;
      if (input.autoAssign !== undefined) inbox.autoAssign = input.autoAssign;
      return { ...inbox };
    },
    async disconnect(id) {
      await latency();
      const inbox = inboxStore.find((i) => i.id === id);
      if (!inbox) notFound("Inbox");
      inbox.status = "disconnected";
    },
    async test() {
      await latency();
      return { ok: true };
    },
  },
};
