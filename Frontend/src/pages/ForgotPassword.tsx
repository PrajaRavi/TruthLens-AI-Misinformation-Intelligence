import { useState } from "react";
import Link from "@/router";
import { ArrowLeft, Mail, Send } from "lucide-react";
import { AuthShell } from "@/components/auth/AuthShell";
import { Input, Label } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { ThemeToggle } from "@/components/theme";

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSent(true);
    }, 800);
  }

  return (
    <AuthShell
      title="Reset your password"
      subtitle="Enter your email and we'll send you a reset link."
      footer={
        <Link
          href="/login"
          className="inline-flex items-center gap-1 font-medium text-primary hover:underline"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to sign in
        </Link>
      }
    >
      <div className="mb-4 flex justify-end">
        <ThemeToggle />
      </div>
      {sent ? (
        <div className="rounded-xl border border-risk-low/30 bg-risk-low/5 p-4 text-sm text-foreground/90">
          If an account exists for that email, a password reset link has been
          sent (demo). Check your inbox to continue.
        </div>
      ) : (
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
              <Input
                id="email"
                type="email"
                required
                placeholder="you@example.com"
                className="pl-9"
              />
            </div>
          </div>
          <Button type="submit" className="w-full" loading={loading}>
            {!loading && <Send className="h-4 w-4" />}
            Send reset link
          </Button>
        </form>
      )}
    </AuthShell>
  );
}
