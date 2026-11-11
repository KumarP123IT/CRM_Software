# Konvo Frontend Architecture

## Overview

Konvo is a multi-tenant conversational CRM for WhatsApp businesses, built with React 18, TypeScript, and TanStack Router. This document describes the architecture, conventions, and how to swap mock data for real API calls.

## Tech Stack

- **Framework**: React 18 + Vite
- **Routing**: TanStack Router (file-based routing)
- **State Management**: 
  - React Query (@tanstack/react-query) for server state
  - Zustand for UI state (sidebar, theme, dialogs)
- **UI Components**: shadcn/ui (Radix UI primitives)
- **Styling**: Tailwind CSS with custom design tokens
- **Forms**: React Hook Form + Zod validation
- **Charts**: Recharts
- **Icons**: Lucide React
- **Date Handling**: date-fns
- **Animations**: framer-motion (subtle transitions)
- **Internationalization**: react-i18next
- **Testing**: Vitest + Testing Library

## Project Structure

```
frontend/
├── public/              # Static assets
├── src/
│   ├── api/            # API layer (types, adapters, mocks)
│   │   ├── http.ts     # HTTP client with auth, retry, error normalization
│   │   ├── http-adapter.ts  # Real backend adapter
│   │   ├── mock/       # Mock data and mock adapter
│   │   │   ├── index.ts    # Mock API implementation
│   │   │   └── data.ts     # Realistic mock data (Indian businesses, INR)
│   │   ├── types.ts    # TypeScript interfaces for all API contracts
│   │   └── index.ts    # API export (swaps between mock and real based on env)
│   ├── components/
│   │   ├── app/        # App shell components (Sidebar, TopBar, CommandPalette)
│   │   ├── shared/     # Reusable shared components (PageHeader, EmptyState, etc.)
│   │   └── ui/         # shadcn/ui components
│   ├── features/       # Feature-based modules
│   │   ├── dashboard/  # Dashboard feature
│   │   ├── design/     # Design system showcase
│   │   ├── inbox/      # Conversations (placeholder)
│   │   ├── contacts/   # Contacts (placeholder)
│   │   ├── groups/     # Groups (placeholder)
│   │   ├── broadcasts/ # Broadcasts (placeholder)
│   │   ├── campaigns/  # Campaigns (placeholder)
│   │   ├── templates/  # Templates (placeholder)
│   │   ├── leads/      # Leads (placeholder)
│   │   ├── calls/      # Calls (placeholder)
│   │   ├── bots/       # Bots (placeholder)
│   │   ├── ai/         # AI Agents (placeholder)
│   │   ├── ads/        # Ads (placeholder)
│   │   ├── analytics/  # Analytics (placeholder)
│   │   └── settings/   # Settings (placeholder)
│   ├── hooks/          # Custom React hooks
│   │   ├── useKeyboardNavigation.ts  # Keyboard shortcuts (j/k, Enter, Esc, /, ?)
│   │   └── useUnsavedChangesGuard.ts # Form unsaved changes warning
│   ├── lib/            # Utilities
│   │   ├── i18n.ts     # i18next configuration
│   │   ├── permissions.ts  # Permission system
│   │   ├── theme.tsx   # Theme provider
│   │   ├── format.ts   # Formatting utilities
│   │   └── utils.ts    # General utilities (cn, etc.)
│   ├── routes/         # TanStack Router file-based routes
│   │   ├── __root.tsx      # Root layout with providers
│   │   ├── index.tsx       # Home redirect
│   │   ├── login.tsx       # Login page
│   │   ├── register.tsx    # Registration page
│   │   ├── forgot-password.tsx  # Password reset
│   │   ├── _authenticated.tsx  # Authenticated layout wrapper
│   │   ├── _authenticated.dashboard.tsx
│   │   ├── _authenticated.conversations.tsx
│   │   ├── _authenticated.contacts.tsx
│   │   ├── _authenticated.design.tsx
│   │   └── ... (other authenticated routes)
│   ├── stores/         # Zustand stores
│   │   ├── auth.ts     # Authentication state
│   │   └── ui.ts       # UI state (sidebar, theme, modals)
│   ├── styles.css      # Tailwind CSS with design tokens
│   ├── start.ts        # TanStack Start server entry
│   └── router.tsx      # Router configuration
├── docs/               # Documentation
│   └── ARCHITECTURE.md # This file
├── .env.example        # Environment variables template
├── package.json
├── tsconfig.json
├── vite.config.ts
└── vitest.config.ts
```

## Design System

### Color Palette

All colors are defined as CSS variables in `src/styles.css` using OKLCH for better color manipulation.

- **Primary**: Indigo-violet (#5B5BD6) - used for primary actions, links, and key UI elements
- **Success**: Mint green (#12B76A) - used ONLY for success states and WhatsApp channel badge
- **Warning**: Amber - for warnings and cautionary states
- **Danger**: Rose - for destructive actions and errors
- **Info**: Sky blue - for informational messages
- **Neutrals**: Slate with a faint violet tint for backgrounds, cards, borders

### Typography

- **Headings**: Plus Jakarta Sans (display font with -0.015em letter-spacing)
- **Body**: Inter (UI font)
- **Scale**: 12px, 13px, 14px, 16px, 20px, 24px, 32px
- **Numbers**: Tabular numerals for all metrics and data

### Spacing & Layout

- **Base unit**: 4px grid
- **Card radius**: 12px
- **Control radius**: 10px
- **Shadows**: 3 levels (soft, card, float)
- **Transitions**: 150-200ms ease-out (respects prefers-reduced-motion)

### Components

Key shared components in `src/components/shared/`:
- `PageHeader` - Page title with optional description and actions
- `EmptyState` - Consistent empty state with icon, title, description, and CTA
- `ErrorState` - Error display with retry button
- `ListSkeleton` - Loading skeleton for lists
- `PresenceAvatar` - Avatar with online presence indicator
- `StatCard` - Metric card with value, delta, and sparkline chart
- `ProgressRing` - Circular progress indicator
- `Guarded` - Permission-aware wrapper for components
- `FilterBar` - Container for filter controls
- `Kbd` - Keyboard shortcut indicator

## API Layer

### Architecture

The API layer is split into three parts:

1. **Types** (`src/api/types.ts`): TypeScript interfaces defining all API contracts
2. **Mock Adapter** (`src/api/mock/index.ts`): In-memory implementation with realistic data
3. **HTTP Adapter** (`src/api/http-adapter.ts`): Real backend adapter using HTTP client
4. **HTTP Client** (`src/api/http.ts`): Base HTTP client with auth, retry, error normalization

### Switching Between Mock and Real API

The API layer automatically switches between mock and real adapters based on the `VITE_USE_MOCKS` environment variable:

```typescript
// src/api/index.ts
const useMocks = (import.meta.env["VITE_USE_MOCKS"] ?? "true") !== "false";
export const api: Api = useMocks ? mockApi : httpApi;
```

**To use real backend:**
1. Copy `.env.example` to `.env`
2. Set `VITE_USE_MOCKS=false`
3. Set `VITE_API_BASE_URL` to your backend URL

**To use mock data (default):**
- Leave `VITE_USE_MOCKS=true` or unset (defaults to true)

### HTTP Client Features

The HTTP client (`src/api/http.ts`) provides:
- **Auth header injection**: Automatically adds Bearer token from auth store
- **Error normalization**: Converts all errors to consistent `HttpError` format
- **Automatic retry**: Retries GET requests on 5xx errors (exponential backoff)
- **Query parameters**: URL encoding for query params
- **Type safety**: Full TypeScript generics

### API Interfaces

All services implement typed interfaces defined in `src/api/types.ts`:

```typescript
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
  // ... more methods
}
```

### Mock Data

Mock data in `src/api/mock/data.ts` includes:
- **40 contacts** with Indian names, +91 phone numbers, realistic cities, tags, and custom fields
- **12 conversations** with Hinglish messages, different statuses, channels (WhatsApp, Instagram, Web)
- **5 templates** with various categories and statuses
- **3 bots** with different triggers
- **8 leads** in various pipeline stages
- **Team members** with different roles
- **Activity feed** and **call reminders**

All data uses INR currency and Indian context.

## State Management

### React Query (Server State)

Used for all API calls. Queries are cached and automatically refetched:
```typescript
const q = useQuery({
  queryKey: ["conversations", "assigned", userId],
  queryFn: () => api.conversations.list({ assigneeId: userId, pageSize: 6 }),
});
```

Mutations with optimistic updates:
```typescript
const resolve = useMutation({
  mutationFn: (id: string) => api.conversations.setStatus(id, "resolved"),
  onSuccess: () => {
    toast.success("Chat marked as resolved");
    void qc.invalidateQueries({ queryKey: ["conversations"] });
  },
});
```

### Zustand (UI State)

Used for ephemeral UI state:

**Auth Store** (`src/stores/auth.ts`):
- User and token (persisted)
- Workspace ID
- Dev-only role preview

**UI Store** (`src/stores/ui.ts`):
- Sidebar collapsed state (persisted)
- Theme preference (persisted)
- Command palette open state
- Shortcuts dialog open state

## Routing

TanStack Router uses file-based routing. Route structure:

```
/                          → redirects to /dashboard
/login                     → Login page
/register                  → Registration page
/forgot-password           → Password reset
/_authenticated/*          → Authenticated routes (protected by auth guard)
  /dashboard              → Dashboard
  /conversations          → Inbox
  /contacts               → Contacts
  /groups                 → Groups
  /broadcasts             → Broadcasts
  /campaigns              → Campaigns
  /templates             → Templates
  /ads                    → Ads
  /leads                  → Leads
  /calls                  → Calls
  /bots                   → Bots
  /ai-agents              → AI Agents
  /comment-automation     → Comment Automation
  /analytics              → Analytics
  /settings               → Settings
  /design                 → Design system showcase (hidden)
```

### Auth Guard

The `_authenticated` layout uses `useAuthGuard()` to check authentication and redirect to `/login` if not signed in:
```typescript
export function useAuthGuard() {
  const navigate = useNavigate();
  const user = useAuth((s) => s.user);
  const hydrated = useAuthHydrated();
  useEffect(() => {
    if (hydrated && !user) void navigate({ to: "/login", replace: true });
  }, [hydrated, user, navigate]);
  return { ready: hydrated && !!user };
}
```

## Permission System

Permissions are role-based and defined in `src/lib/permissions.ts`:

**Roles**: Owner, Admin, Manager, Agent, Read-only

**Permissions**: 
- `conversation.reply`, `conversation.assign`
- `contact.create`, `contact.delete`
- `broadcast.create`, `template.create`
- `lead.edit`, `bot.edit`, `ai.configure`
- `ads.manage`, `analytics.view`
- `settings.manage`, `billing.manage`, `team.invite`

**Usage**:
```typescript
const { allowed, reason } = usePermission("broadcast.create");

// Disable mode (default)
<Guarded perm="broadcast.create">
  <Button>Create broadcast</Button>
</Guarded>

// Hide mode
<Guarded perm="broadcast.create" mode="hide">
  <Button>Create broadcast</Button>
</Guarded>
```

**Dev Role Switcher**: A floating component (dev-only) allows previewing the UI as different roles.

## Internationalization

Using react-i18next. Translations in `src/lib/i18n.ts`:
```typescript
const en = {
  nav: {
    home: "Home",
    dashboard: "Dashboard",
    // ...
  },
  dashboard: {
    greeting_morning: "Good morning, {{name}}",
    // ...
  },
};
```

Usage:
```typescript
const { t } = useTranslation();
<h1>{t("dashboard.greeting_morning", { name: "Priya" })}</h1>
```

## Feature Conventions

### Feature Structure

Each feature follows this pattern:
```
src/features/{feature}/
├── components/     # Feature-specific components
├── hooks/          # Feature-specific hooks
├── types.ts        # Feature-specific types (if needed)
└── {Feature}.tsx   # Main feature component
```

### Page Components

Pages should be thin containers that orchestrate components:
```typescript
export function Dashboard() {
  return (
    <div className="space-y-6">
      <PageHeader title="Dashboard" description="Your day at a glance." />
      <SetupChecklist />
      <Metrics />
      <div className="grid gap-6 lg:grid-cols-3">
        <AssignedChats />
        <CallReminders />
      </div>
      <RecentActivity />
    </div>
  );
}
```

### Loading & Error States

Every list should have:
- Skeleton loading state
- Empty state with icon, title, description, and CTA
- Error state with retry button

Use shared components:
```typescript
{q.isPending ? (
  <ListSkeleton />
) : q.isError ? (
  <ErrorState onRetry={() => q.refetch()} />
) : items.length === 0 ? (
  <EmptyState icon={Icon} title="No items" description="..." action={<Button>Create</Button>} />
) : (
  <List items={items} />
)}
```

### Custom Hooks

Reusable hooks in `src/hooks/`:

**useKeyboardNavigation**: Provides keyboard shortcuts for lists and pages
```typescript
useKeyboardNavigation({
  onMoveUp: () => handlePrevious(),
  onMoveDown: () => handleNext(),
  onOpen: () => handleOpen(),
  onClose: () => handleClose(),
  onSearch: () => openCommandPalette(),
  onHelp: () => openShortcutsDialog(),
  enabled: true,
});
```
Shortcuts: j/k or arrows to move, Enter to open, Esc to close, / for search, ? for help.

**useUnsavedChangesGuard**: Warns before navigating away from dirty forms
```typescript
useUnsavedChangesGuard({
  hasUnsavedChanges: formDirty,
  message: "You have unsaved changes. Are you sure you want to leave?",
});
```
Prevents route changes and tab closes when there are unsaved changes.

## Development Workflow

### Running the App

```bash
# Install dependencies
npm install

# Run dev server
npm run dev

# Build for production
npm run build

# Run tests
npm run test
```

### Adding a New Page

1. Create route file: `src/routes/_authenticated.{page}.tsx`
2. Create feature component: `src/features/{page}/{Page}.tsx`
3. Add navigation link in `src/components/app/nav.ts`
4. Add translation keys in `src/lib/i18n.ts`

### Adding a New API Endpoint

1. Add interface to `src/api/types.ts`
2. Implement in `src/api/http-adapter.ts`
3. Implement in `src/api/mock/index.ts`
4. Add mock data to `src/api/mock/data.ts` if needed

### Adding a New UI Component

1. Add to `src/components/ui/` (using shadcn/ui pattern)
2. Add to design system page: `src/features/design/DesignSystem.tsx`
3. Add documentation comment

## Testing

- Unit tests with Vitest
- Component tests with Testing Library
- Test location: `src/test/` (or colocated with components)

## Accessibility

- Semantic HTML throughout
- Focus rings on interactive elements
- ARIA labels where needed
- Screen reader friendly dialogs
- Keyboard navigation support (j/k for lists, Enter to open, Esc to close, / for search, ? for help)
- Touch targets minimum 44px
- Responsive from 360px to 1920px

## Performance

- Code splitting via TanStack Router
- Lazy loading for heavy components
- React Query caching for API calls
- Optimistic updates for common actions
- Virtualization for long lists (when implemented)

## Security

- No secrets in frontend code
- API keys sent to backend, only masked values returned
- Auth tokens stored in Zustand with persistence
- HTTPS required in production
- CSRF protection via TanStack Start middleware

## Deployment

- Built with Vite
- Server-side rendering via TanStack Start
- Nitro server (configurable targets: Cloudflare, Node, etc.)
- Static assets optimized

## Future Enhancements

- Feature-based routing (move routes into feature folders)
- Storybook for component development
- E2E tests with Playwright
- Service worker for offline support
- PWA capabilities
- Advanced bot builder with React Flow
- Real-time updates via WebSockets
