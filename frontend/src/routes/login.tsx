import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { api } from "@/api";
import { useAuth } from "@/stores/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign in — Konvo" },
      { name: "description", content: "Sign in to your Konvo workspace." },
      { property: "og:title", content: "Sign in — Konvo" },
      {
        property: "og:description",
        content: "Sign in to your Konvo workspace.",
      },
    ],
  }),
  component: Login,
});

function Login() {
  const navigate = useNavigate();
  const signIn = useAuth((s) => s.signIn);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const r = await api.auth.login({ email, password });
      signIn(r.user, r.token);
      await navigate({ to: "/dashboard" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't sign in");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <form
        onSubmit={submit}
        className="mx-auto flex w-full max-w-sm flex-col justify-center gap-4 p-6"
      >
        <h1 className="text-2xl font-bold">Welcome back</h1>
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            autoComplete="username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="pw">Password</Label>
          <Input
            id="pw"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {error && (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        )}
        <Button type="submit" loading={loading} disabled={!email || password.length < 6}>
          Sign in
        </Button>
      </form>
      <div className="bg-panel hidden flex-col justify-center gap-4 p-12 lg:flex">
        <p className="font-display text-2xl font-bold">One inbox for your whole team.</p>
        <p>Reply faster on WhatsApp.</p>
        <p>Never lose a lead.</p>
        <p>Message everyone in one tap.</p>
      </div>
    </div>
  );
}
