/**
 * In-process pub/sub for inbox realtime events (SSE). Single-instance only —
 * move to Redis pub/sub when running multiple replicas.
 */
export type InboxRealtimeEvent =
  | { type: "message"; conversationId: string; message: unknown }
  | { type: "conversation"; conversation: unknown }
  | { type: "typing"; conversationId: string; on: boolean };

const hubs = new Map<string, Set<(event: InboxRealtimeEvent) => void>>();

export function subscribeInbox(
  workspaceId: string,
  listener: (event: InboxRealtimeEvent) => void,
): () => void {
  let set = hubs.get(workspaceId);
  if (!set) {
    set = new Set();
    hubs.set(workspaceId, set);
  }
  set.add(listener);
  return () => {
    set.delete(listener);
    if (set.size === 0) hubs.delete(workspaceId);
  };
}

export function publishInbox(workspaceId: string, event: InboxRealtimeEvent): void {
  const set = hubs.get(workspaceId);
  if (!set) return;
  for (const listener of set) {
    try {
      listener(event);
    } catch {
      // a broken listener must not break ingestion
    }
  }
}
