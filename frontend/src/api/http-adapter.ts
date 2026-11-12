import { BASE_URL, getAuthToken, http, httpText } from "./http";
import type { Api, ContactListParams, InboxEvent } from "./types";

/** Real backend adapter. Endpoints are the contract the backend must implement. */
export const httpApi: Api = {
  auth: {
    login: (body) => http("/auth/login", { method: "POST", body }),
    register: (body) => http("/auth/register", { method: "POST", body }),
    forgotPassword: (body) => http("/auth/forgot-password", { method: "POST", body }),
    checkSlug: (slug) => http(`/auth/check-slug?slug=${slug}`),
  },
  workspaces: {
    list: () => http("/workspaces"),
    get: (id) => http(`/workspaces/${id}`),
    update: (id, input) => http(`/workspaces/${id}`, { method: "PATCH", body: input }),
  },
  contacts: {
    list: (p?: ContactListParams) =>
      http("/contacts", {
        query: {
          page: p?.page,
          pageSize: p?.pageSize,
          search: p?.search,
          tag: p?.tag,
          source: p?.source,
          optedOut: p?.optedOut === undefined ? undefined : String(p.optedOut),
          groupId: p?.groupId,
        },
      }),
    get: (id) => http(`/contacts/${id}`),
    create: (input) => http("/contacts", { method: "POST", body: input }),
    update: (id, input) => http(`/contacts/${id}`, { method: "PATCH", body: input }),
    remove: (id) => http(`/contacts/${id}`, { method: "DELETE" }),
    bulk: (input) => http("/contacts/bulk", { method: "POST", body: input }),
    importPreview: (csv) => http("/contacts/import/preview", { method: "POST", body: { csv } }),
    importCommit: (rows) => http("/contacts/import/commit", { method: "POST", body: { rows } }),
    exportCsv: (p) =>
      httpText("/contacts/export", {
        search: p?.search,
        tag: p?.tag,
        source: p?.source,
        optedOut: p?.optedOut === undefined ? undefined : String(p.optedOut),
        groupId: p?.groupId,
        ids: p?.ids?.join(","),
      }),
    updateNotes: (id, notes) => http(`/contacts/${id}/notes`, { method: "PATCH", body: { notes } }),
  },
  tags: {
    list: () => http("/tags"),
    create: (input) => http("/tags", { method: "POST", body: input }),
    update: (id, input) => http(`/tags/${id}`, { method: "PATCH", body: input }),
    remove: (id) => http(`/tags/${id}`, { method: "DELETE" }),
  },
  groups: {
    list: () => http("/groups"),
    get: (id) => http(`/groups/${id}`),
    create: (input) => http("/groups", { method: "POST", body: input }),
    update: (id, input) => http(`/groups/${id}`, { method: "PATCH", body: input }),
    remove: (id) => http(`/groups/${id}`, { method: "DELETE" }),
    addMembers: (id, contactIds) =>
      http(`/groups/${id}/members`, { method: "POST", body: { contactIds } }),
    removeMembers: (id, contactIds) =>
      http(`/groups/${id}/members`, { method: "DELETE", body: { contactIds } }),
  },
  conversations: {
    list: (p) =>
      http("/conversations", {
        query: {
          page: p?.page,
          pageSize: p?.pageSize,
          search: p?.search,
          assigneeId: p?.assigneeId,
          status: p?.status,
          tag: p?.tag,
          channel: p?.channel,
          tab: p?.tab,
          viewerId: p?.viewerId,
        },
      }),
    get: (id) => http(`/conversations/${id}`),
    messages: (id) => http(`/conversations/${id}/messages`),
    send: (id, input) => http(`/conversations/${id}/messages`, { method: "POST", body: input }),
    assign: (id, assigneeId) =>
      http(`/conversations/${id}/assign`, {
        method: "POST",
        body: { assigneeId },
      }),
    setStatus: (id, status) =>
      http(`/conversations/${id}/status`, { method: "POST", body: { status } }),
    snooze: (id, until) => http(`/conversations/${id}/snooze`, { method: "POST", body: { until } }),
    transfer: (id, teamId) =>
      http(`/conversations/${id}/transfer`, { method: "POST", body: { teamId } }),
    markRead: (id) => http(`/conversations/${id}/read`, { method: "POST" }),
    quickReplies: () => http("/conversations/quick-replies"),
    subscribe(listener: (event: InboxEvent) => void) {
      // SSE — EventSource can't set Authorization, so the token rides in the query.
      const url = new URL(
        `${BASE_URL}/conversations/events`,
        typeof window !== "undefined" ? window.location.origin : "http://localhost",
      );
      const token = getAuthToken();
      if (token) url.searchParams.set("token", token);
      const es = new EventSource(url);
      es.onmessage = (e) => {
        try {
          listener(JSON.parse(e.data as string) as InboxEvent);
        } catch {
          // ignore malformed events
        }
      };
      return () => es.close();
    },
  },
  templates: {
    list: (p) =>
      http("/templates", {
        query: { status: p?.status, search: p?.search },
      }),
    get: (id) => http(`/templates/${id}`),
    create: (input) => http("/templates", { method: "POST", body: input }),
    update: (id, input) => http(`/templates/${id}`, { method: "PATCH", body: input }),
    remove: (id) => http(`/templates/${id}`, { method: "DELETE" }),
    submit: (id) => http(`/templates/${id}/submit`, { method: "POST" }),
    approve: (id) => http(`/templates/${id}/approve`, { method: "POST" }),
    reject: (id, reason) => http(`/templates/${id}/reject`, { method: "POST", body: { reason } }),
  },
  broadcasts: {
    list: (p) =>
      http("/broadcasts", {
        query: {
          page: p?.page,
          pageSize: p?.pageSize,
          search: p?.search,
          status: p?.status,
          campaignId: p?.campaignId,
        },
      }),
    get: (id) => http(`/broadcasts/${id}`),
    recipients: (id, p) =>
      http(`/broadcasts/${id}/recipients`, {
        query: { page: p?.page, pageSize: p?.pageSize, status: p?.status },
      }),
    create: (input) => http("/broadcasts", { method: "POST", body: input }),
    update: (id, input) => http(`/broadcasts/${id}`, { method: "PATCH", body: input }),
    send: (id) => http(`/broadcasts/${id}/send`, { method: "POST" }),
    cancel: (id) => http(`/broadcasts/${id}/cancel`, { method: "POST" }),
    remove: (id) => http(`/broadcasts/${id}`, { method: "DELETE" }),
  },
  campaigns: {
    list: (p) =>
      http("/campaigns", {
        query: { page: p?.page, pageSize: p?.pageSize, search: p?.search, status: p?.status },
      }),
    get: (id) => http(`/campaigns/${id}`),
    create: (input) => http("/campaigns", { method: "POST", body: input }),
    update: (id, input) => http(`/campaigns/${id}`, { method: "PATCH", body: input }),
    remove: (id) => http(`/campaigns/${id}`, { method: "DELETE" }),
  },
  leads: {
    list: (p) =>
      http("/leads", {
        query: {
          page: p?.page,
          pageSize: p?.pageSize,
          search: p?.search,
          stage: p?.stage,
          ownerId: p?.ownerId,
        },
      }),
    get: (id) => http(`/leads/${id}`),
    create: (input) => http("/leads", { method: "POST", body: input }),
    update: (id, input) => http(`/leads/${id}`, { method: "PATCH", body: input }),
    remove: (id) => http(`/leads/${id}`, { method: "DELETE" }),
  },
  calls: {
    logs: (p) =>
      http("/calls/logs", {
        query: { page: p?.page, pageSize: p?.pageSize, search: p?.search, direction: p?.direction },
      }),
    log: (input) => http("/calls/logs", { method: "POST", body: input }),
    removeLog: (id) => http(`/calls/logs/${id}`, { method: "DELETE" }),
    reminders: (p) =>
      http("/calls/reminders", {
        query: {
          upcoming: p?.upcoming ? "true" : undefined,
          includeDone: p?.includeDone ? "true" : undefined,
        },
      }),
    addReminder: (input) => http("/calls/reminders", { method: "POST", body: input }),
    updateReminder: (id, input) => http(`/calls/reminders/${id}`, { method: "PATCH", body: input }),
    removeReminder: (id) => http(`/calls/reminders/${id}`, { method: "DELETE" }),
  },
  analytics: {
    overview: (days) => http("/analytics/overview", { query: { days } }),
  },
  automation: {
    businessHours: () => http("/automation/business-hours"),
    updateBusinessHours: (input) =>
      http("/automation/business-hours", { method: "PUT", body: input }),
    autoReplies: () => http("/automation/auto-replies"),
    createAutoReply: (input) => http("/automation/auto-replies", { method: "POST", body: input }),
    updateAutoReply: (id, input) =>
      http(`/automation/auto-replies/${id}`, { method: "PATCH", body: input }),
    removeAutoReply: (id) => http(`/automation/auto-replies/${id}`, { method: "DELETE" }),
  },
  ads: {
    list: () => http("/ads"),
    create: (input) => http("/ads", { method: "POST", body: input }),
    update: (id, input) => http(`/ads/${id}`, { method: "PATCH", body: input }),
    remove: (id) => http(`/ads/${id}`, { method: "DELETE" }),
  },
  webhookEndpoints: {
    list: () => http("/webhook-endpoints"),
    create: (input) => http("/webhook-endpoints", { method: "POST", body: input }),
    update: (id, input) => http(`/webhook-endpoints/${id}`, { method: "PATCH", body: input }),
    remove: (id) => http(`/webhook-endpoints/${id}`, { method: "DELETE" }),
    rotateSecret: (id) => http(`/webhook-endpoints/${id}/rotate-secret`, { method: "POST" }),
    test: (id) => http(`/webhook-endpoints/${id}/test`, { method: "POST" }),
    deliveries: (id) => http(`/webhook-endpoints/${id}/deliveries`),
  },
  apiKeys: {
    list: () => http("/api-keys"),
    create: (input) => http("/api-keys", { method: "POST", body: input }),
    revoke: (id) => http(`/api-keys/${id}/revoke`, { method: "POST" }),
    remove: (id) => http(`/api-keys/${id}`, { method: "DELETE" }),
  },
  security: {
    totpStatus: () => http("/auth/2fa/status"),
    totpSetup: () => http("/auth/2fa/setup", { method: "POST" }),
    totpEnable: (code) => http("/auth/2fa/enable", { method: "POST", body: { code } }),
    totpDisable: (code) => http("/auth/2fa/disable", { method: "POST", body: { code } }),
    changePassword: (input) => http("/auth/password", { method: "POST", body: input }),
  },
  bots: {
    list: () => http("/bots"),
    create: (input) => http("/bots", { method: "POST", body: input }),
    update: (id, input) => http(`/bots/${id}`, { method: "PATCH", body: input }),
    remove: (id) => http(`/bots/${id}`, { method: "DELETE" }),
  },
  team: {
    list: () => http("/team"),
    teams: () => http("/teams"),
  },
  dashboard: {
    stats: () => http("/dashboard/stats"),
    activity: () => http("/dashboard/activity"),
    callReminders: () => http("/dashboard/call-reminders"),
    onboarding: () => http("/dashboard/onboarding"),
  },
  integrations: {
    saveOpenAiKey: (key) => http("/integrations/openai", { method: "POST", body: { key } }),
    openaiStatus: () => http("/integrations/openai"),
    removeOpenAiKey: () => http("/integrations/openai", { method: "DELETE" }),
    testOpenAi: () => http("/integrations/openai/test", { method: "POST" }),
    suggestReplies: (conversationId) =>
      http("/integrations/ai/suggest", { method: "POST", body: { conversationId } }),
  },
  inboxes: {
    list: () => http("/channels"),
    get: (id) => http(`/channels/${id}`),
    connect: (input) => http("/channels/connect", { method: "POST", body: input }),
    update: (id, input) => http(`/channels/${id}`, { method: "PATCH", body: input }),
    disconnect: (id) => http(`/channels/${id}`, { method: "DELETE" }),
    test: (id) => http(`/channels/${id}/test`, { method: "POST" }),
  },
};
