import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Smartphone,
  Plus,
  Check,
  AlertCircle,
  Clock,
  Shield,
  Zap,
  RefreshCw,
  Trash2,
  MessageSquare,
  Settings,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { EmptyState, ListSkeleton, PageHeader } from "@/components/shared";
import { toast } from "sonner";
import { api } from "@/api";
import { cn } from "@/lib/utils";

export function Inboxes() {
  const qc = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [testMessageSent, setTestMessageSent] = useState(false);

  const q = useQuery({
    queryKey: ["inboxes"],
    queryFn: () => api.inboxes.list(),
  });

  const disconnect = useMutation({
    mutationFn: (id: string) => api.inboxes.disconnect(id),
    onSuccess: () => {
      toast.success("WhatsApp disconnected");
      void qc.invalidateQueries({ queryKey: ["inboxes"] });
    },
    onError: () => toast.error("Failed to disconnect"),
  });

  const sendTestMessage = useMutation({
    mutationFn: (id: string) => api.inboxes.sendTestMessage(id),
    onSuccess: () => {
      setTestMessageSent(true);
      toast.success("Test message sent");
    },
    onError: () => toast.error("Failed to send test message"),
  });

  if (q.isPending) return <ListSkeleton />;
  if (q.isError)
    return (
      <Alert variant="destructive">
        <AlertCircle className="size-4" />
        <AlertDescription>Failed to load inboxes. Please try again.</AlertDescription>
      </Alert>
    );

  const inboxes = q.data ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Inboxes"
        description="Connect your WhatsApp Business numbers to receive and send messages."
        action={
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="size-4 mr-2" />
            Connect WhatsApp
          </Button>
        }
      />

      {inboxes.length === 0 ? (
        <EmptyState
          icon={Smartphone}
          title="No inboxes connected"
          description="Connect your WhatsApp Business number to start messaging your customers."
          action={
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className="size-4 mr-2" />
              Connect WhatsApp
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4">
          {inboxes.map((inbox) => (
            <Card key={inbox.id} className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="flex size-12 items-center justify-center rounded-full bg-success-soft">
                    <MessageSquare className="size-6 text-success" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{inbox.name}</h3>
                      <Badge
                        variant={inbox.status === "connected" ? "default" : "destructive"}
                      >
                        {inbox.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{inbox.phoneNumber}</p>
                    <div className="flex items-center gap-3 mt-2">
                      {inbox.qualityRating && (
                        <div className="flex items-center gap-1 text-xs">
                          <Shield className="size-3" />
                          <span className="text-muted-foreground">Quality:</span>
                          <span className="font-medium">{inbox.qualityRating}</span>
                        </div>
                      )}
                      {inbox.messagingTier && (
                        <div className="flex items-center gap-1 text-xs">
                          <Zap className="size-3" />
                          <span className="text-muted-foreground">Tier:</span>
                          <span className="font-medium">{inbox.messagingTier}</span>
                        </div>
                      )}
                    </div>
                    {inbox.webhookVerified === false && (
                      <Alert variant="destructive" className="mt-3">
                        <AlertCircle className="size-4" />
                        <AlertDescription>
                          Webhook not verified. Incoming messages may not be received.
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={inbox.autoAssign}
                    onCheckedChange={(checked) =>
                      toast.success(inbox.autoAssign ? "Auto-assign disabled" : "Auto-assign enabled")
                    }
                  />
                  <span className="text-sm text-muted-foreground">Auto-assign</span>
                  <Button variant="ghost" size="sm" onClick={() => sendTestMessage.mutate(inbox.id)}>
                    Test
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => disconnect.mutate(inbox.id)}>
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <ConnectWizard
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        step={step}
        setStep={setStep}
        testMessageSent={testMessageSent}
        setTestMessageSent={setTestMessageSent}
      />
    </div>
  );
}

function ConnectWizard({
  open,
  onOpenChange,
  step,
  setStep,
  testMessageSent,
  setTestMessageSent,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  step: number;
  setStep: (step: number) => void;
  testMessageSent: boolean;
  setTestMessageSent: (sent: boolean) => void;
}) {
  const qc = useQueryClient();
  const [loading, setLoading] = useState(false);

  const connectWaba = useMutation({
    mutationFn: (code: string) => api.inboxes.connectWaba(code),
    onSuccess: () => {
      toast.success("WhatsApp connected successfully");
      void qc.invalidateQueries({ queryKey: ["inboxes"] });
      setStep(4);
    },
    onError: () => toast.error("Failed to connect WhatsApp"),
  });

  const launchEmbeddedSignup = () => {
    setLoading(true);
    // Mock: Simulate Embedded Signup redirect
    setTimeout(() => {
      setLoading(false);
      setStep(3);
    }, 2000);
  };

  const completeWizard = () => {
    onOpenChange(false);
    setStep(1);
    setTestMessageSent(false);
  };

  const steps = [
    {
      title: "What you need",
      icon: Check,
      content: (
        <div className="space-y-4">
          <Alert>
            <Check className="size-4" />
            <AlertDescription>
              Make sure you have a Meta Business account and a WhatsApp Business account.
            </AlertDescription>
          </Alert>
          <Alert>
            <Check className="size-4" />
            <AlertDescription>
              Your phone number should not already be on the WhatsApp app.
            </AlertDescription>
          </Alert>
          <Alert>
            <Check className="size-4" />
            <AlertDescription>
              You need admin access to the Meta Business account.
            </AlertDescription>
          </Alert>
        </div>
      ),
    },
    {
      title: "Connect with Meta",
      icon: Settings,
      content: (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Click the button below to open Meta's Embedded Signup. This will connect your WhatsApp
            Business account to Konvo.
          </p>
          <Button
            className="w-full"
            size="lg"
            onClick={launchEmbeddedSignup}
            loading={loading}
          >
            <MessageSquare className="size-4 mr-2" />
            Launch Embedded Signup
          </Button>
          <p className="text-xs text-muted-foreground">
            You'll be redirected to Meta to authorize Konvo.
          </p>
        </div>
      ),
    },
    {
      title: "Choose phone number",
      icon: Smartphone,
      content: (
        <div className="space-y-4">
          <div className="space-y-3">
            <Card className="p-4 cursor-pointer border-primary bg-primary-soft">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">+91 98765 43210</p>
                  <p className="text-sm text-muted-foreground">Business Verified</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge>High Quality</Badge>
                  <Badge>Tier 2</Badge>
                </div>
              </div>
            </Card>
            <Card className="p-4 cursor-pointer hover:bg-muted">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">+91 98765 43211</p>
                  <p className="text-sm text-muted-foreground">Not Verified</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">Medium Quality</Badge>
                  <Badge variant="secondary">Tier 1</Badge>
                </div>
              </div>
            </Card>
          </div>
        </div>
      ),
    },
    {
      title: "You're all set!",
      icon: Check,
      content: (
        <div className="space-y-4">
          <Alert className="border-success bg-success-soft text-success">
            <Check className="size-4" />
            <AlertDescription>
              Your WhatsApp Business number is now connected and ready to use.
            </AlertDescription>
          </Alert>
          <Button
            className="w-full"
            variant="outline"
            onClick={() => setTestMessageSent(true)}
            disabled={testMessageSent}
          >
            <MessageSquare className="size-4 mr-2" />
            {testMessageSent ? "Test message sent!" : "Send test message"}
          </Button>
        </div>
      ),
    },
  ];

  const currentStep = steps[step - 1];
  const progress = (step / steps.length) * 100;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <currentStep.icon className="size-5" />
            {currentStep.title}
          </DialogTitle>
          <DialogDescription>
            Step {step} of {steps.length}
          </DialogDescription>
        </DialogHeader>

        <Progress value={progress} className="my-4" />

        <div className="py-4">{currentStep.content}</div>

        <DialogFooter>
          {step > 1 && step < 4 && (
            <Button variant="outline" onClick={() => setStep(step - 1)}>
              Back
            </Button>
          )}
          {step < 3 && (
            <Button onClick={() => setStep(step + 1)} disabled={step === 2 && loading}>
              Next
            </Button>
          )}
          {step === 3 && (
            <Button onClick={() => connectWaba.mutate("mock-code")} loading={connectWaba.isPending}>
              Connect
            </Button>
          )}
          {step === 4 && (
            <Button onClick={completeWizard}>Done</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
