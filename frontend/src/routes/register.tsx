import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { api } from "@/api";
import { useAuth } from "@/stores/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { AlertCircle, Check, X } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/register")({
  head: () => ({
    meta: [
      { title: "Create workspace — Konvo" },
      { name: "description", content: "Create your Konvo workspace." },
      { property: "og:title", content: "Create workspace — Konvo" },
      { property: "og:description", content: "Create your Konvo workspace." },
    ],
  }),
  component: Register,
});

function Register() {
  const navigate = useNavigate();
  const signIn = useAuth((s) => s.signIn);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [business, setBusiness] = useState("");
  const [slug, setSlug] = useState("");
  const [terms, setTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [slugAvailable, setSlugAvailable] = useState<boolean | null>(null);
  const [slugChecking, setSlugChecking] = useState(false);

  // Password strength calculation
  const getPasswordStrength = (pwd: string) => {
    let strength = 0;
    if (pwd.length >= 8) strength += 1;
    if (pwd.length >= 12) strength += 1;
    if (/[a-z]/.test(pwd)) strength += 1;
    if (/[A-Z]/.test(pwd)) strength += 1;
    if (/[0-9]/.test(pwd)) strength += 1;
    if (/[^a-zA-Z0-9]/.test(pwd)) strength += 1;
    return Math.min(strength, 5);
  };

  const passwordStrength = getPasswordStrength(password);
  const strengthColors = [
    "bg-destructive",
    "bg-destructive",
    "bg-warning",
    "bg-info",
    "bg-success",
  ];
  const strengthLabels = ["Weak", "Fair", "Good", "Strong", "Very strong"];

  // Slug availability check (debounced)
  const checkSlugAvailability = async (value: string) => {
    if (!value) {
      setSlugAvailable(null);
      return;
    }
    setSlugChecking(true);
    try {
      const result = await api.auth.checkSlug(value);
      setSlugAvailable(result.available);
    } catch {
      setSlugAvailable(null);
    }
    setSlugChecking(false);
  };

  const handleSlugChange = (value: string) => {
    const slug = value
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");
    setSlug(slug);
    checkSlugAvailability(slug);
  };

  const handleBusinessChange = (value: string) => {
    setBusiness(value);
    handleSlugChange(value);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const r = await api.auth.register({
        name,
        email,
        password,
        business,
        slug,
      });
      signIn(r.user, r.token);
      await navigate({ to: "/dashboard" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't create account");
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
        <h1 className="text-2xl font-bold">Create your workspace</h1>
        <div className="space-y-1.5">
          <Label htmlFor="name">Your name</Label>
          <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="email">Work email</Label>
          <Input
            id="email"
            type="email"
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
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {password && (
            <div className="space-y-2">
              <Progress value={(passwordStrength / 5) * 100} className="h-1" />
              <p className="text-xs text-muted-foreground">
                Password strength:{" "}
                <span className={cn(strengthColors[passwordStrength - 1], "font-medium")}>
                  {strengthLabels[passwordStrength - 1]}
                </span>
              </p>
            </div>
          )}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="business">Business name</Label>
          <Input
            id="business"
            value={business}
            onChange={(e) => handleBusinessChange(e.target.value)}
            required
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="slug">Workspace URL</Label>
          <div className="flex items-center">
            <span className="mr-2 text-sm text-muted-foreground">konvo.app/</span>
            <Input
              id="slug"
              value={slug}
              onChange={(e) => handleSlugChange(e.target.value)}
              required
              className={cn(
                slugAvailable === false && "border-destructive",
                slugAvailable === true && "border-success",
              )}
            />
            {slugChecking && (
              <div className="ml-2">
                <div className="size-4 border-2 border-t-primary rounded-full animate-spin" />
              </div>
            )}
            {slugAvailable === true && <Check className="ml-2 size-4 text-success" />}
            {slugAvailable === false && <X className="ml-2 size-4 text-destructive" />}
          </div>
          {slugAvailable === false && (
            <p className="text-xs text-destructive mt-1">This URL is already taken</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Checkbox
            id="terms"
            checked={terms}
            onCheckedChange={(v) => setTerms(v === true)}
            required
          />
          <Label htmlFor="terms" className="text-sm">
            I agree to the{" "}
            <a href="#" className="text-primary hover:underline">
              Terms of Service
            </a>{" "}
            and{" "}
            <a href="#" className="text-primary hover:underline">
              Privacy Policy
            </a>
          </Label>
        </div>
        {error && (
          <p role="alert" className="text-sm text-destructive flex items-center gap-2">
            <AlertCircle className="size-4" />
            {error}
          </p>
        )}
        <Button
          type="submit"
          loading={loading}
          disabled={
            !name ||
            !email ||
            password.length < 8 ||
            !business ||
            !slug ||
            slugAvailable === false ||
            !terms
          }
        >
          Create workspace
        </Button>
        <div className="text-center">
          <Button variant="ghost" asChild>
            <a href="/login">Already have an account? Sign in</a>
          </Button>
        </div>
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
