import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import {
  Outlet,
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  RouterProvider,
} from "@tanstack/react-router";
import { useAuth } from "@/stores/auth";
import { useAuthGuard } from "./useAuthGuard";
import type { User } from "@/api/types";

const user: User = {
  id: "u1",
  name: "Priya Sharma",
  email: "priya@chaipointcafe.in",
  avatarColor: 0,
  role: "owner",
  online: true,
};

function GuardedPage() {
  const { ready } = useAuthGuard();
  if (!ready) return <div>loading</div>;
  return <div>protected</div>;
}

function renderGuard(initial: string) {
  const root = createRootRoute({ component: () => <Outlet /> });
  const login = createRoute({
    getParentRoute: () => root,
    path: "/login",
    component: () => <div>sign-in</div>,
  });
  const app = createRoute({
    getParentRoute: () => root,
    path: "/dashboard",
    component: GuardedPage,
  });
  const router = createRouter({
    routeTree: root.addChildren([login, app]),
    history: createMemoryHistory({ initialEntries: [initial] }),
  });
  render(<RouterProvider router={router} />);
  return router;
}

describe("auth guard redirect", () => {
  beforeEach(() => {
    localStorage.clear();
    useAuth.setState({ user: null, token: null, previewRole: null });
  });
  afterEach(() => {
    localStorage.clear();
    useAuth.setState({ user: null, token: null, previewRole: null });
  });

  it("sends signed-out users to /login", async () => {
    const router = renderGuard("/dashboard");
    await waitFor(() => {
      expect(router.state.location.pathname).toBe("/login");
    });
  });

  it("lets a signed-in user stay on the protected route", async () => {
    useAuth.setState({ user, token: "mock-token" });
    const router = renderGuard("/dashboard");
    await waitFor(() => {
      expect(router.state.location.pathname).toBe("/dashboard");
      expect(screen.getByText("protected")).toBeInTheDocument();
    });
  });
});
