import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { api } from "@/api";
import { HttpError } from "@/api/http";
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
  const [totpCode, setTotpCode] = useState("");
  const [needsTotp, setNeedsTotp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const r = await api.auth.login({
        email,
        password,
        ...(needsTotp ? { totpCode } : {}),
      });
      signIn(r.user, r.token);
      await navigate({ to: "/dashboard" });
    } catch (err) {
      if (err instanceof HttpError && err.code === "totp_required") {
        setNeedsTotp(true);
        setError("Enter the 6-digit code from your authenticator app.");
      } else {
        setError(err instanceof Error ? err.message : "Couldn't sign in");
      }
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
        {needsTotp && (
          <div className="space-y-1.5">
            <Label htmlFor="totp">Two-factor code</Label>
            <Input
              id="totp"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              value={totpCode}
              onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, ""))}
              placeholder="000000"
              required
            />
          </div>
        )}
        {error && (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        )}
        <Button
          type="submit"
          loading={loading}
          disabled={!email || password.length < 6 || (needsTotp && totpCode.length !== 6)}
        >
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
