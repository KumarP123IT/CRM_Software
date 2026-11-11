import type { Api, Contact, Conversation, ListParams, Page } from "../types";
import { HttpError } from "../http";
import * as db from "./data";

const latency = () =>
  new Promise((r) => setTimeout(r, 250 + Math.random() * 350));

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
      c.name.toLowerCase().includes(s) ||
      c.phone.replace(/\s/g, "").includes(s.replace(/\s/g, ""))
    );
  return (
    c.contactName.toLowerCase().includes(s) ||
    c.lastMessage.toLowerCase().includes(s)
  );
}

export const mockApi: Api = {
  auth: {
    async login({ email }) {
      await latency();
      if (email.endsWith("@fail.test"))
        throw new HttpError({
          status: 401,
          code: "invalid_credentials",
          message: "That email and password don't match.",
        });
      return { user: { ...db.team[0]!, email }, token: "mock-token" };
    },
    async register({ name, email, slug }) {
      await latency();
      return {
        user: { ...db.team[0]!, id: "u_new", name, email },
        token: "mock-token",
      };
    },
    async forgotPassword() {
      await latency();
    },
    async checkSlug(slug) {
      await latency();
      // Mock: all slugs are available except "taken"
      return { available: slug !== "taken" };
    },
  },
  workspaces: {
    async list() {
      await latency();
      return db.workspaces;
    },
  },
  contacts: {
    async list(p) {
      await latency();
      return paginate(
        db.contacts.filter((c) => matches(c, p?.search)),
        p,
      );
    },
    async get(id) {
      await latency();
      const c = db.contacts.find((x) => x.id === id);
      if (!c)
        throw new HttpError({
          status: 404,
          code: "not_found",
          message: "Contact not found",
        });
      return c;
    },
  },
  conversations: {
    async list(p) {
      await latency();
      const rows = db.conversations.filter(
        (c) =>
          matches(c, p?.search) &&
          (!p?.assigneeId || c.assigneeId === p.assigneeId) &&
          (!p?.status || c.status === p.status),
      );
      return paginate(rows, p);
    },
    async assign(id, assigneeId) {
      await latency();
      const c = db.conversations.find((x) => x.id === id);
      if (!c)
        throw new HttpError({
          status: 404,
          code: "not_found",
          message: "Chat not found",
        });
      c.assigneeId = assigneeId;
      return { ...c };
    },
    async setStatus(id, status) {
      await latency();
      const c = db.conversations.find((x) => x.id === id);
      if (!c)
        throw new HttpError({
          status: 404,
          code: "not_found",
          message: "Chat not found",
        });
      c.status = status;
      return { ...c };
    },
  },
  templates: {
    async list() {
      await latency();
      return db.templates;
    },
  },
  broadcasts: {
    async list() {
      await latency();
      return db.broadcasts;
    },
  },
  leads: {
    async list() {
      await latency();
      return db.leads;
    },
  },
  bots: {
    async list() {
      await latency();
      return db.bots;
    },
  },
  team: {
    async list() {
      await latency();
      return db.team;
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
        { id: "connect", done: true },
        { id: "import", done: true },
        { id: "template", done: false },
        { id: "invite", done: false },
        { id: "broadcast", done: false },
      ];
    },
  },
  integrations: {
    async saveOpenAiKey(key) {
      await latency();
      return { masked: `sk-...${key.slice(-4)}` };
    },
  },
  inboxes: {
    async list() {
      await latency();
      return [
        {
          id: "inbox_1",
          name: "Chai Point Café",
          phoneNumber: "+91 98765 43210",
          status: "connected",
          qualityRating: "High",
          messagingTier: "Tier 2",
          webhookVerified: true,
          autoAssign: true,
        },
      ];
    },
    async connectWaba() {
      await latency();
    },
    async disconnect() {
      await latency();
    },
    async sendTestMessage() {
      await latency();
    },
  },
};
