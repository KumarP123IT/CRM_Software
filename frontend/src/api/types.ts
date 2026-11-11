export type ID = string;
export type ISODate = string;

export type Role = "owner" | "admin" | "manager" | "agent" | "readonly";

export interface User {
  id: ID;
  name: string;
  email: string;
  avatarColor: number;
  role: Role;
  online: boolean;
}

export interface Workspace {
  id: ID;
  name: string;
  plan: "Starter" | "Growth" | "Pro";
  city: string;
}

export interface CustomField {
  label: string;
  value: string;
}

export interface Contact {
  id: ID;
  name: string;
  phone: string;
  email?: string | undefined;
  city: string;
  tags: string[];
  optedIn: boolean;
  lifetimeValue: number; // INR
  lastSeenAt: ISODate;
  createdAt: ISODate;
  customFields: CustomField[];
  notes: string;
}

export type ConversationStatus = "open" | "pending" | "resolved";
export type Channel = "whatsapp" | "instagram" | "web";
export type MessageKind =
  "text" | "image" | "document" | "voice" | "template" | "interactive" | "note";
export type DeliveryStatus = "sent" | "delivered" | "read" | "failed";

export interface InteractiveButton {
  id: string;
  label: string;
}

export interface Message {
  id: ID;
  conversationId: ID;
  direction: "in" | "out";
  kind: MessageKind;
  body: string;
  sentAt: ISODate;
  authorId?: ID | undefined;
  status?: DeliveryStatus | undefined;
  failReason?: string | undefined;
  replyToId?: ID | undefined;
  mediaUrl?: string | undefined;
  fileName?: string | undefined;
  durationSec?: number | undefined;
  buttons?: InteractiveButton[] | undefined;
  templateName?: string | undefined;
}

export interface Team {
  id: ID;
  name: string;
}

export interface QuickReply {
  id: ID;
  shortcut: string;
  body: string;
}

export interface Conversation {
  id: ID;
  contactId: ID;
  contactName: string;
  assigneeId?: ID | undefined;
  teamId?: ID | undefined;
  status: ConversationStatus;
  unread: number;
  lastMessage: string;
  lastMessageAt: ISODate;
  tags: string[];
  channel: Channel;
  slaDueAt?: ISODate | undefined;
  windowClosesAt: ISODate;
  snoozedUntil?: ISODate | undefined;
}

export type InboxTab = "mine" | "unassigned" | "all";

export type InboxEvent =
  | { type: "message"; conversationId: ID; message: Message }
  | { type: "typing"; conversationId: ID; on: boolean };

export interface ConversationListParams extends ListParams {
  assigneeId?: ID | undefined;
  status?: ConversationStatus | undefined;
  tag?: string | undefined;
  channel?: Channel | undefined;
  tab?: InboxTab | undefined;
  viewerId?: ID | undefined;
}

export interface SendMessageInput {
  kind: MessageKind;
  body: string;
  replyToId?: ID | undefined;
  fileName?: string | undefined;
  templateId?: ID | undefined;
}

export interface Template {
  id: ID;
  name: string;
  category: "Marketing" | "Utility" | "Authentication";
  language: string;
  status: "approved" | "pending" | "rejected";
  body: string;
}

export interface Broadcast {
  id: ID;
  name: string;
  templateId: ID;
  audience: string;
  status: "draft" | "scheduled" | "sent";
  sent: number;
  delivered: number;
  read: number;
  scheduledAt?: ISODate;
}

export type LeadStage =
  "new" | "contacted" | "qualified" | "proposal" | "won" | "lost";

export interface Lead {
  id: ID;
  contactId: ID;
  title: string;
  value: number;
  stage: LeadStage;
  ownerId: ID;
  updatedAt: ISODate;
}

export interface Bot {
  id: ID;
  name: string;
  trigger: string;
  active: boolean;
  runs: number;
}

export interface CallReminder {
  id: ID;
  contactName: string;
  phone: string;
  at: ISODate;
  note: string;
}

export interface ActivityItem {
  id: ID;
  kind: "message" | "lead" | "broadcast" | "contact" | "assignment";
  text: string;
  at: ISODate;
  actorName: string;
}

export interface DashboardStats {
  openConversations: { value: number; trend: number[]; delta: number };
  avgResponseMins: { value: number; trend: number[]; delta: number };
  newLeads: { value: number; trend: number[]; delta: number };
  messagesToday: { value: number; trend: number[]; delta: number };
}

export interface OnboardingStep {
  id: "connect" | "import" | "template" | "invite" | "broadcast";
  done: boolean;
}

export interface Page<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface ListParams {
  page?: number;
  pageSize?: number;
  search?: string;
}

export interface ApiError {
  status: number;
  code: string;
  message: string;
}

/* ---------- Service interfaces (implemented by mock + http adapters) ---------- */

export interface AuthApi {
  login(input: {
    email: string;
    password: string;
  }): Promise<{ user: User; token: string }>;
  register(input: {
    name: string;
    email: string;
    password: string;
    business: string;
    slug: string;
  }): Promise<{ user: User; token: string }>;
  forgotPassword(input: { email: string }): Promise<void>;
  checkSlug(slug: string): Promise<{ available: boolean }>;
}
export interface WorkspacesApi {
  list(): Promise<Workspace[]>;
}
export interface ContactsApi {
  list(params?: ListParams): Promise<Page<Contact>>;
  get(id: ID): Promise<Contact>;
  updateNotes(id: ID, notes: string): Promise<Contact>;
}
export interface ConversationsApi {
  list(params?: ConversationListParams): Promise<Page<Conversation>>;
  get(id: ID): Promise<Conversation>;
  messages(id: ID): Promise<Message[]>;
  send(id: ID, input: SendMessageInput): Promise<Message>;
  assign(id: ID, assigneeId: ID | null): Promise<Conversation>;
  setStatus(id: ID, status: ConversationStatus): Promise<Conversation>;
  snooze(id: ID, until: ISODate): Promise<Conversation>;
  transfer(id: ID, teamId: ID): Promise<Conversation>;
  markRead(id: ID): Promise<Conversation>;
  quickReplies(): Promise<QuickReply[]>;
  subscribe(listener: (event: InboxEvent) => void): () => void;
}
export interface TemplatesApi {
  list(): Promise<Template[]>;
}
export interface BroadcastsApi {
  list(): Promise<Broadcast[]>;
}
export interface LeadsApi {
  list(): Promise<Lead[]>;
}
export interface BotsApi {
  list(): Promise<Bot[]>;
}
export interface DashboardApi {
  stats(): Promise<DashboardStats>;
  activity(): Promise<ActivityItem[]>;
  callReminders(): Promise<CallReminder[]>;
  onboarding(): Promise<OnboardingStep[]>;
}
export interface TeamApi {
  list(): Promise<User[]>;
  teams(): Promise<Team[]>;
}
export interface IntegrationsApi {
  /** Key is sent to the backend; only a masked form is ever returned. */
  saveOpenAiKey(key: string): Promise<{ masked: string }>;
}

export interface Inbox {
  id: ID;
  name: string;
  phoneNumber: string;
  status: "connected" | "disconnected" | "error";
  qualityRating?: string;
  messagingTier?: string;
  webhookVerified: boolean;
  autoAssign: boolean;
}

export interface InboxesApi {
  list(): Promise<Inbox[]>;
  connectWaba(code: string): Promise<void>;
  disconnect(id: ID): Promise<void>;
  sendTestMessage(id: ID): Promise<void>;
}

export interface Api {
  auth: AuthApi;
  workspaces: WorkspacesApi;
  contacts: ContactsApi;
  conversations: ConversationsApi;
  templates: TemplatesApi;
  broadcasts: BroadcastsApi;
  leads: LeadsApi;
  bots: BotsApi;
  dashboard: DashboardApi;
  team: TeamApi;
  integrations: IntegrationsApi;
  inboxes: InboxesApi;
}
