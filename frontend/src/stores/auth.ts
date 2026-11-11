import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Role, User } from "@/api/types";
import { setTokenGetter } from "@/api/http";

interface AuthState {
  user: User | null;
  token: string | null;
  workspaceId: string;
  /** Dev-only override to preview each role. */
  previewRole: Role | null;
  signIn: (user: User, token: string) => void;
  signOut: () => void;
  setWorkspace: (id: string) => void;
  setPreviewRole: (r: Role | null) => void;
}

export const useAuth = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      workspaceId: "w1",
      previewRole: null,
      signIn: (user, token) => set({ user, token }),
      signOut: () => set({ user: null, token: null, previewRole: null }),
      setWorkspace: (workspaceId) => set({ workspaceId }),
      setPreviewRole: (previewRole) => set({ previewRole }),
    }),
    { name: "konvo-auth", skipHydration: true },
  ),
);

setTokenGetter(() => useAuth.getState().token);

export const useEffectiveRole = (): Role => {
  const { user, previewRole } = useAuth();
  return previewRole ?? user?.role ?? "readonly";
};
