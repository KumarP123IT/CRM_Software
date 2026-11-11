import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { api } from "@/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, Clock } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({
    meta: [
      { title: "Reset password — Konvo" },
      { name: "description", content: "Reset your Konvo password." },
      { property: "og:title", content: "Reset password — Konvo" },
      { property: "og:description", content: "Reset your Konvo password." },
    ],
  }),
  component: ForgotPassword,
});

function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  // Cooldown timer effect
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cooldown > 0) {
      toast.error(`Please wait ${cooldown} seconds before requesting another email`);
      return;
    }
    setLoading(true);
    setError("");
    try {
      await api.auth.forgotPassword({ email });
      setSent(true);
      setCooldown(60); // 60 second cooldown
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't send reset email");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = () => {
    const syntheticEvent = new Event("submit", { cancelable: true });
    Object.assign(syntheticEvent, { preventDefault: () => {} });
    submit(syntheticEvent as unknown as React.FormEvent);
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <form
        onSubmit={submit}
        className="mx-auto flex w-full max-w-sm flex-col justify-center gap-4 p-6"
      >
        {sent ? (
          <>
            <h1 className="text-2xl font-bold">Check your email</h1>
            <p className="text-muted-foreground">
              We sent a password reset link to {email}. Click the link to set a new password.
            </p>
            <div className="mt-4 p-4 rounded-lg bg-muted/50">
              <p className="text-sm text-muted-foreground mb-2">Didn't receive it?</p>
              <Button
                variant="outline"
                size="sm"
                onClick={handleResend}
                disabled={cooldown > 0}
                className="w-full"
              >
                {cooldown > 0 ? (
                  <>
                    <Clock className="size-4 mr-2" />
                    Resend in {cooldown}s
                  </>
                ) : (
                  "Resend email"
                )}
              </Button>
            </div>
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate({ to: "/login" })}
              className="w-full"
            >
              Back to sign in
            </Button>
          </>
        ) : (
          <>
            <h1 className="text-2xl font-bold">Reset your password</h1>
            <p className="text-muted-foreground">
              Enter your email and we'll send you a reset link.
            </p>
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            {error && (
              <p role="alert" className="text-sm text-destructive flex items-center gap-2">
                <AlertCircle className="size-4" />
                {error}
              </p>
            )}
            <Button type="submit" loading={loading} disabled={!email} className="w-full">
              Send reset link
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => navigate({ to: "/login" })}
              className="w-full"
            >
              Back to sign in
            </Button>
          </>
        )}
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
