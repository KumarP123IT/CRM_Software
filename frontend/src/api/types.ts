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
  widgetAllowedDomains?: string[] | undefined;
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
  /** Backend-provided extras (optional in older mocks). */
  source?: string | undefined;
  company?: string | undefined;
  designation?: string | undefined;
  country?: string | undefined;
  optedOut?: boolean | undefined;
}

export type ConversationStatus = "open" | "pending" | "resolved";
export type Channel = "whatsapp" | "instagram" | "messenger" | "telegram" | "web" | "sms" | "email";
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
  windowClosesAt?: ISODate | undefined;
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

export interface TemplateButton {
  id?: string | undefined;
  text: string;
}

export interface Template {
  id: ID;
  name: string;
  category: "Marketing" | "Utility" | "Authentication";
  language: string;
  status: "draft" | "approved" | "pending" | "rejected";
  body: string;
  headerMedia?: string | undefined;
  buttons?: TemplateButton[] | undefined;
  rejectionReason?: string | undefined;
  providerTemplateId?: string | undefined;
  createdAt?: ISODate | undefined;
  updatedAt?: ISODate | undefined;
}

export interface CreateTemplateInput {
  name: string;
  category?: Template["category"] | undefined;
  language?: string | undefined;
  body: string;
  headerMedia?: string | undefined;
  buttons?: TemplateButton[] | undefined;
}

export type UpdateTemplateInput = Partial<CreateTemplateInput>;

export type BroadcastStatus = "draft" | "scheduled" | "sending" | "sent" | "cancelled" | "failed";

export interface Broadcast {
  id: ID;
  name: string;
  templateId: ID;
  templateName?: string | undefined;
  /** Canonical descriptor: "all" | "opted-in" | "group:{id}" | "tag:{name}". */
  audience: string;
  audienceLabel?: string | undefined;
  status: BroadcastStatus;
  sent: number;
  delivered: number;
  read: number;
  failed?: number | undefined;
  skipped?: number | undefined;
  total?: number | undefined;
  scheduledAt?: ISODate | undefined;
  campaignId?: ID | undefined;
  channelAccountId?: ID | undefined;
  createdAt?: ISODate | undefined;
  updatedAt?: ISODate | undefined;
}

export type BroadcastRecipientStatus =
  "pending" | "queued" | "sent" | "delivered" | "read" | "failed" | "skipped";

export interface BroadcastRecipient {
  id: ID;
  contactId: ID;
  contactName: string;
  phone: string;
  status: BroadcastRecipientStatus;
  error?: string | undefined;
  sentAt?: ISODate | undefined;
  deliveredAt?: ISODate | undefined;
  readAt?: ISODate | undefined;
  failedAt?: ISODate | undefined;
}

export interface CreateBroadcastInput {
  name: string;
  templateId: ID;
  audience: string;
  channelAccountId?: ID | undefined;
  campaignId?: ID | undefined;
  /** ISO datetime — omit to send immediately. */
  scheduledAt?: ISODate | undefined;
}

export interface UpdateBroadcastInput {
  name?: string | undefined;
  audience?: string | undefined;
  channelAccountId?: ID | null | undefined;
  campaignId?: ID | null | undefined;
  scheduledAt?: ISODate | null | undefined;
}

export interface BroadcastListParams extends ListParams {
  status?: BroadcastStatus | undefined;
  campaignId?: ID | undefined;
}

export type CampaignStatus = "draft" | "active" | "paused" | "completed" | "cancelled";

export interface Campaign {
  id: ID;
  name: string;
  description: string;
  status: CampaignStatus;
  broadcastCount: number;
  sent: number;
  delivered: number;
  read: number;
  createdAt: ISODate;
  updatedAt: ISODate;
}

export interface CampaignBroadcast {
  id: ID;
  name: string;
  templateId: ID;
  templateName?: string | undefined;
  audience: string;
  status: BroadcastStatus;
  sent: number;
  delivered: number;
  read: number;
  scheduledAt?: ISODate | undefined;
  createdAt: ISODate;
}

export interface CampaignDetail extends Campaign {
  broadcasts: CampaignBroadcast[];
}

export interface CreateCampaignInput {
  name: string;
  description?: string | undefined;
}

export interface UpdateCampaignInput {
  name?: string | undefined;
  description?: string | undefined;
  status?: CampaignStatus | undefined;
}

export type LeadStage = "new" | "contacted" | "qualified" | "proposal" | "won" | "lost";

export interface Lead {
  id: ID;
  contactId: ID;
  contactName?: string | undefined;
  phone?: string | undefined;
  title: string;
  value: number;
  stage: LeadStage;
  ownerId: ID;
  ownerName?: string | undefined;
  createdAt?: ISODate | undefined;
  updatedAt: ISODate;
}

export interface LeadListParams extends ListParams {
  stage?: LeadStage | undefined;
  ownerId?: ID | undefined;
}

export interface CreateLeadInput {
  contactId: ID;
  title: string;
  value?: number | undefined;
  stage?: LeadStage | undefined;
  ownerId?: ID | undefined;
}

export type UpdateLeadInput = Partial<Omit<CreateLeadInput, "contactId">> & {
  contactId?: ID | undefined;
};

export type AutomationTrigger = "first_message" | "keyword" | "outside_hours";

export interface BotTrigger {
  type: AutomationTrigger;
  keywords?: string[] | undefined;
  response: string;
}

export interface Bot {
  id: ID;
  name: string;
  trigger: BotTrigger;
  active: boolean;
  runs: number;
  createdAt?: ISODate | undefined;
  updatedAt?: ISODate | undefined;
}

export interface CreateBotInput {
  name: string;
  trigger: BotTrigger;
  active?: boolean | undefined;
}

export type UpdateBotInput = Partial<CreateBotInput>;

export interface DayHours {
  day: number; // 0 = Sunday … 6 = Saturday
  open: string; // "HH:MM"
  close: string;
}

export interface BusinessHoursConfig {
  enabled: boolean;
  timezone: string;
  hours: DayHours[];
}

export interface AutoReply {
  id: ID;
  name: string;
  trigger: AutomationTrigger;
  keywords: string[];
  response: string;
  active: boolean;
  createdAt: ISODate;
  updatedAt: ISODate;
}

export interface CreateAutoReplyInput {
  name?: string | undefined;
  trigger: AutomationTrigger;
  keywords?: string[] | undefined;
  response: string;
  active?: boolean | undefined;
}

export type UpdateAutoReplyInput = Partial<CreateAutoReplyInput>;

export interface Ad {
  id: ID;
  name: string;
  phone: string;
  message: string;
  active: boolean;
  clicks: number;
  createdAt: ISODate;
  updatedAt: ISODate;
  waLink: string;
}

export interface CreateAdInput {
  name: string;
  phone: string;
  message?: string | undefined;
  active?: boolean | undefined;
}

export type UpdateAdInput = Partial<CreateAdInput>;

export const WEBHOOK_EVENT_NAMES = [
  "message.created",
  "conversation.created",
  "conversation.assigned",
  "conversation.status_changed",
  "contact.created",
  "lead.created",
  "broadcast.sent",
] as const;

export interface WebhookEndpoint {
  id: ID;
  url: string;
  events: string;
  active: boolean;
  hasSecret: boolean;
  deliveryCount: number;
  createdAt: ISODate;
  updatedAt: ISODate;
}

export interface WebhookEndpointWithSecret extends WebhookEndpoint {
  secret: string;
}

export interface CreateWebhookEndpointInput {
  url: string;
  events: string[];
  active?: boolean | undefined;
}

export type UpdateWebhookEndpointInput = Partial<CreateWebhookEndpointInput>;

export interface WebhookDeliveryInfo {
  id: ID;
  event: string;
  status: number | null;
  attempts: number;
  deliveredAt: ISODate | null;
  lastError: string | null;
  createdAt: ISODate;
}

export interface WebhooksApi {
  list(): Promise<WebhookEndpoint[]>;
  create(input: CreateWebhookEndpointInput): Promise<WebhookEndpointWithSecret>;
  update(id: ID, input: UpdateWebhookEndpointInput): Promise<WebhookEndpoint>;
  remove(id: ID): Promise<void>;
  rotateSecret(id: ID): Promise<{ secret: string }>;
  test(id: ID): Promise<{ deliveryId: ID }>;
  deliveries(id: ID): Promise<WebhookDeliveryInfo[]>;
}

export type ApiKeyScope = "read" | "write";

export interface ApiKey {
  id: ID;
  name: string;
  prefix: string;
  scopes: ApiKeyScope[];
  lastUsedAt: ISODate | null;
  revokedAt: ISODate | null;
  createdAt: ISODate;
}

export interface ApiKeyWithSecret extends ApiKey {
  key: string;
}

export interface CreateApiKeyInput {
  name: string;
  scopes?: ApiKeyScope[] | undefined;
}

export interface ApiKeysApi {
  list(): Promise<ApiKey[]>;
  create(input: CreateApiKeyInput): Promise<ApiKeyWithSecret>;
  revoke(id: ID): Promise<ApiKey>;
  remove(id: ID): Promise<void>;
}

export interface SecurityApi {
  totpStatus(): Promise<{ enabled: boolean }>;
  totpSetup(): Promise<{ secret: string; otpauthUrl: string }>;
  totpEnable(code: string): Promise<{ enabled: boolean }>;
  totpDisable(code: string): Promise<{ enabled: boolean }>;
  changePassword(input: { currentPassword: string; newPassword: string }): Promise<{ ok: boolean }>;
}

export interface CallReminder {
  id: ID;
  contactId?: ID | undefined;
  contactName: string;
  phone: string;
  at: ISODate;
  note: string;
  done?: boolean | undefined;
  createdAt?: ISODate | undefined;
}

export type CallDirection = "inbound" | "outbound";

export interface CallLog {
  id: ID;
  contactId?: ID | undefined;
  contactName?: string | undefined;
  phone: string;
  direction?: CallDirection | undefined;
  durationSec?: number | undefined;
  note?: string | undefined;
  recordingUrl?: string | undefined;
  at: ISODate;
}

export interface CallLogListParams extends ListParams {
  direction?: CallDirection | undefined;
}

export interface CreateCallLogInput {
  contactId?: ID | undefined;
  phone: string;
  direction?: CallDirection | undefined;
  durationSec?: number | undefined;
  note?: string | undefined;
  recordingUrl?: string | undefined;
  at?: ISODate | undefined;
}

export interface CreateCallReminderInput {
  contactId?: ID | undefined;
  contactName: string;
  phone: string;
  note?: string | undefined;
  at: ISODate;
}

export interface UpdateCallReminderInput {
  contactName?: string | undefined;
  phone?: string | undefined;
  note?: string | undefined;
  at?: ISODate | undefined;
  done?: boolean | undefined;
}

export interface AnalyticsOverview {
  days: number;
  totals: {
    contacts: number;
    conversations: number;
    leads: number;
    wonValue: number;
    messagesIn: number;
    messagesOut: number;
  };
  conversationsByStatus: { status: ConversationStatus; count: number }[];
  leadsByStage: { stage: LeadStage; count: number; value: number }[];
  channelBreakdown: { channel: Channel; conversations: number; messages: number }[];
  topAgents: { userId: ID; name: string; replies: number }[];
  messagesByDay: { date: string; incoming: number; outgoing: number }[];
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
  page?: number | undefined;
  pageSize?: number | undefined;
  search?: string | undefined;
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
    totpCode?: string | undefined;
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
export interface ContactListParams extends ListParams {
  tag?: string | undefined;
  source?: string | undefined;
  optedOut?: boolean | undefined;
  groupId?: ID | undefined;
}

export interface CreateContactInput {
  name?: string | undefined;
  phone: string;
  email?: string | undefined;
  company?: string | undefined;
  designation?: string | undefined;
  country?: string | undefined;
  city?: string | undefined;
  source?: string | undefined;
  optedOut?: boolean | undefined;
  tags?: string[] | undefined;
  customFields?: CustomField[] | undefined;
  notes?: string | undefined;
  /** Also create a lead for this contact. */
  createLead?: boolean | undefined;
  leadTitle?: string | undefined;
}

export type UpdateContactInput = Partial<
  Omit<CreateContactInput, "phone" | "createLead" | "leadTitle">
>;

export type BulkContactAction =
  "addTags" | "removeTags" | "setOptedOut" | "addToGroup" | "removeFromGroup" | "delete";

export interface BulkContactsInput {
  ids: ID[];
  action: BulkContactAction;
  tags?: string[] | undefined;
  groupId?: ID | undefined;
  optedOut?: boolean | undefined;
}

export type ImportRowStatus = "new" | "duplicate" | "invalid";

export interface ImportPreviewRow {
  /** 1-based row number in the original file (header = row 1). */
  index: number;
  status: ImportRowStatus;
  errors: string[];
  existingId?: ID | undefined;
  data: CreateContactInput;
}

export interface ImportPreview {
  rows: ImportPreviewRow[];
  totals: { total: number; new: number; duplicates: number; invalid: number };
}

export interface ImportCommitResult {
  created: number;
  updated: number;
  skipped: number;
}

export interface Tag {
  id: ID;
  name: string;
  color?: string | undefined;
  contactCount?: number | undefined;
}

export interface GroupRule {
  field: string;
  operator:
    | "equals"
    | "not_equals"
    | "contains"
    | "not_contains"
    | "greater_than"
    | "less_than"
    | "is_empty"
    | "is_not_empty";
  value: string;
  logic?: "AND" | "OR" | undefined;
}

export interface ContactGroup {
  id: ID;
  name: string;
  kind: "static" | "dynamic";
  memberCount: number;
  rules?: GroupRule[] | undefined;
  createdAt: ISODate;
}

export interface GroupDetail extends ContactGroup {
  members: Pick<Contact, "id" | "name" | "phone" | "email" | "city" | "tags" | "optedIn">[];
}

export interface ContactsApi {
  list(params?: ContactListParams): Promise<Page<Contact>>;
  get(id: ID): Promise<Contact>;
  create(input: CreateContactInput): Promise<Contact>;
  update(id: ID, input: UpdateContactInput): Promise<Contact>;
  remove(id: ID): Promise<void>;
  bulk(input: BulkContactsInput): Promise<{ affected: number }>;
  importPreview(csv: string): Promise<ImportPreview>;
  importCommit(rows: CreateContactInput[]): Promise<ImportCommitResult>;
  /** Raw CSV text of contacts matching the filters (or explicit ids). */
  exportCsv(
    params?: Omit<ContactListParams, "page" | "pageSize"> & { ids?: ID[] },
  ): Promise<string>;
  updateNotes(id: ID, notes: string): Promise<Contact>;
}

export interface TagsApi {
  list(): Promise<Tag[]>;
  create(input: { name: string; color?: string }): Promise<Tag>;
  update(id: ID, input: { name?: string; color?: string }): Promise<Tag>;
  remove(id: ID): Promise<void>;
}

export interface GroupsApi {
  list(): Promise<ContactGroup[]>;
  get(id: ID): Promise<GroupDetail>;
  create(input: {
    name: string;
    kind?: "static" | "dynamic";
    rules?: GroupRule[];
  }): Promise<ContactGroup>;
  update(
    id: ID,
    input: { name?: string; kind?: "static" | "dynamic"; rules?: GroupRule[] },
  ): Promise<ContactGroup>;
  remove(id: ID): Promise<void>;
  addMembers(id: ID, contactIds: ID[]): Promise<{ added: number; memberCount: number }>;
  removeMembers(id: ID, contactIds: ID[]): Promise<{ removed: number; memberCount: number }>;
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
  list(params?: { status?: Template["status"]; search?: string }): Promise<Template[]>;
  get(id: ID): Promise<Template>;
  create(input: CreateTemplateInput): Promise<Template>;
  update(id: ID, input: UpdateTemplateInput): Promise<Template>;
  remove(id: ID): Promise<void>;
  /** draft|rejected → pending; syncs to WhatsApp when a connected account exists. */
  submit(id: ID): Promise<Template>;
  approve(id: ID): Promise<Template>;
  reject(id: ID, reason?: string): Promise<Template>;
}
export interface BroadcastsApi {
  list(params?: BroadcastListParams): Promise<Broadcast[]>;
  get(id: ID): Promise<Broadcast>;
  recipients(
    id: ID,
    params?: ListParams & { status?: BroadcastRecipientStatus },
  ): Promise<Page<BroadcastRecipient>>;
  create(input: CreateBroadcastInput): Promise<Broadcast>;
  update(id: ID, input: UpdateBroadcastInput): Promise<Broadcast>;
  /** Send a draft now, or send a scheduled broadcast immediately. */
  send(id: ID): Promise<Broadcast>;
  cancel(id: ID): Promise<Broadcast>;
  remove(id: ID): Promise<void>;
}
export interface CampaignsApi {
  list(params?: ListParams & { status?: CampaignStatus }): Promise<Campaign[]>;
  get(id: ID): Promise<CampaignDetail>;
  create(input: CreateCampaignInput): Promise<Campaign>;
  update(id: ID, input: UpdateCampaignInput): Promise<Campaign>;
  remove(id: ID): Promise<void>;
}
export interface LeadsApi {
  list(params?: LeadListParams): Promise<Page<Lead>>;
  get(id: ID): Promise<Lead>;
  create(input: CreateLeadInput): Promise<Lead>;
  update(id: ID, input: UpdateLeadInput): Promise<Lead>;
  remove(id: ID): Promise<void>;
}
export interface CallsApi {
  logs(params?: CallLogListParams): Promise<Page<CallLog>>;
  log(input: CreateCallLogInput): Promise<CallLog>;
  removeLog(id: ID): Promise<void>;
  reminders(params?: { upcoming?: boolean; includeDone?: boolean }): Promise<CallReminder[]>;
  addReminder(input: CreateCallReminderInput): Promise<CallReminder>;
  updateReminder(id: ID, input: UpdateCallReminderInput): Promise<CallReminder>;
  removeReminder(id: ID): Promise<void>;
}
export interface AnalyticsApi {
  overview(days?: number): Promise<AnalyticsOverview>;
}
export interface BotsApi {
  list(): Promise<Bot[]>;
  create(input: CreateBotInput): Promise<Bot>;
  update(id: ID, input: UpdateBotInput): Promise<Bot>;
  remove(id: ID): Promise<void>;
}
export interface AdsApi {
  list(): Promise<Ad[]>;
  create(input: CreateAdInput): Promise<Ad>;
  update(id: ID, input: UpdateAdInput): Promise<Ad>;
  remove(id: ID): Promise<void>;
}
export interface AutomationApi {
  businessHours(): Promise<BusinessHoursConfig>;
  updateBusinessHours(input: BusinessHoursConfig): Promise<BusinessHoursConfig>;
  autoReplies(): Promise<AutoReply[]>;
  createAutoReply(input: CreateAutoReplyInput): Promise<AutoReply>;
  updateAutoReply(id: ID, input: UpdateAutoReplyInput): Promise<AutoReply>;
  removeAutoReply(id: ID): Promise<void>;
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
  openaiStatus(): Promise<{ configured: boolean; masked: string | null }>;
  removeOpenAiKey(): Promise<void>;
  testOpenAi(): Promise<{ ok: boolean; error?: string | undefined }>;
  suggestReplies(conversationId: ID): Promise<{ suggestions: string[] }>;
}

/** A connected (or connectable) messaging channel — one per ChannelAccount. */
export interface Inbox {
  id: ID;
  name: string;
  type: Channel;
  status: "connected" | "disconnected" | "error" | "pending";
  phoneNumber?: string | undefined;
  qualityRating?: string | undefined;
  messagingTier?: string | undefined;
  webhookVerified: boolean;
  autoAssign: boolean;
  createdAt?: ISODate | undefined;
}

/** Credentials/payloads accepted by POST /channels/connect, discriminated by `type`. */
export type ConnectInboxInput =
  | { type: "telegram"; botToken: string; name?: string }
  | {
      type: "whatsapp";
      code: string;
      phoneNumberId: string;
      businessAccountId?: string;
    }
  | { type: "web"; name: string; domain?: string };

export interface InboxDetail extends Inbox {
  /** Provider webhook path to configure (e.g. in Meta App Dashboard). */
  webhookPath?: string | undefined;
  verifyToken?: string | undefined;
  widgetToken?: string | undefined;
  webhookSecret?: string | undefined;
}

export interface InboxesApi {
  list(): Promise<{ supported: Channel[]; items: Inbox[] }>;
  get(id: ID): Promise<InboxDetail>;
  connect(input: ConnectInboxInput): Promise<Inbox>;
  update(id: ID, input: { name?: string; autoAssign?: boolean }): Promise<Inbox>;
  disconnect(id: ID): Promise<void>;
  test(id: ID): Promise<{ ok: boolean; detail?: string }>;
}

export interface Api {
  auth: AuthApi;
  workspaces: WorkspacesApi;
  contacts: ContactsApi;
  tags: TagsApi;
  groups: GroupsApi;
  conversations: ConversationsApi;
  templates: TemplatesApi;
  broadcasts: BroadcastsApi;
  campaigns: CampaignsApi;
  leads: LeadsApi;
  calls: CallsApi;
  analytics: AnalyticsApi;
  automation: AutomationApi;
  ads: AdsApi;
  webhookEndpoints: WebhooksApi;
  apiKeys: ApiKeysApi;
  security: SecurityApi;
  bots: BotsApi;
  dashboard: DashboardApi;
  team: TeamApi;
  integrations: IntegrationsApi;
  inboxes: InboxesApi;
}
