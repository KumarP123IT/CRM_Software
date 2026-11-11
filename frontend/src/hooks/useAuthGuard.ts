import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/stores/auth";

/** Client-side guard: waits for persisted auth, then redirects to /login if signed out. */
export function useAuthGuard() {
  const navigate = useNavigate();
  const user = useAuth((s) => s.user);
  const hydrated = useAuthHydrated();
  useEffect(() => {
    if (hydrated && !user) void navigate({ to: "/login", replace: true });
  }, [hydrated, user, navigate]);
  return { ready: hydrated && !!user };
}

export function useAuthHydrated() {
  const [h, setH] = useState(false);
  useEffect(() => {
    void useAuth.persist.rehydrate();
    setH(true);
  }, []);
  return h;
}
