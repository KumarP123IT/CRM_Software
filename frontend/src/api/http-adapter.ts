import { http } from "./http";
import type { Api } from "./types";

/** Real backend adapter. Endpoints are the contract the backend must implement. */
export const httpApi: Api = {
  auth: {
    login: (body) => http("/auth/login", { method: "POST", body }),
    register: (body) => http("/auth/register", { method: "POST", body }),
    forgotPassword: (body) =>
      http("/auth/forgot-password", { method: "POST", body }),
    checkSlug: (slug) => http(`/auth/check-slug?slug=${slug}`),
  },
  workspaces: { list: () => http("/workspaces") },
  contacts: {
    list: (p) =>
      http("/contacts", {
        query: { page: p?.page, pageSize: p?.pageSize, search: p?.search },
      }),
    get: (id) => http(`/contacts/${id}`),
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
        },
      }),
    assign: (id, assigneeId) =>
      http(`/conversations/${id}/assign`, {
        method: "POST",
        body: { assigneeId },
      }),
    setStatus: (id, status) =>
      http(`/conversations/${id}/status`, { method: "POST", body: { status } }),
  },
  templates: { list: () => http("/templates") },
  broadcasts: { list: () => http("/broadcasts") },
  leads: { list: () => http("/leads") },
  bots: { list: () => http("/bots") },
  team: { list: () => http("/team") },
  dashboard: {
    stats: () => http("/dashboard/stats"),
    activity: () => http("/dashboard/activity"),
    callReminders: () => http("/dashboard/call-reminders"),
    onboarding: () => http("/dashboard/onboarding"),
  },
  integrations: {
    saveOpenAiKey: (key) =>
      http("/integrations/openai", { method: "POST", body: { key } }),
  },
  inboxes: {
    list: () => http("/inboxes"),
    connectWaba: (code) => http("/inboxes/connect", { method: "POST", body: { code } }),
    disconnect: (id) => http(`/inboxes/${id}`, { method: "DELETE" }),
    sendTestMessage: (id) => http(`/inboxes/${id}/test`, { method: "POST" }),
  },
};
