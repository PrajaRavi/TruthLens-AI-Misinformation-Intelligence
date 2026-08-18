import { useState } from "react";
import Link from "@/router";
import { useRouter } from "@/router";
import { KeyRound, Lock } from "lucide-react";
import { AuthShell } from "@/components/auth/AuthShell";
import { Input, Label } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { ThemeToggle } from "@/components/theme";
import { useToast } from "@/components/ui/Toast";

export default function ResetPasswordPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [pw, setPw] = useState("");
  const [confirm, setConfirm] = useState("");

  const mismatch = confirm.length > 0 && pw !== confirm;

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (mismatch) return;
    setLoading(true);
    setTimeout(() => {
      toast({ type: "success", title: "Password updated (demo)" });
      router.push("/login");
    }, 800);
  }

  return (
    <AuthShell
      title="Set a new password"
      subtitle="Choose a strong password for your account."
      footer={
        <Link href="/login" className="font-medium text-primary hover:underline">
          Back to sign in
        </Link>
      }
    >
      <div className="mb-4 flex justify-end">
        <ThemeToggle />
      </div>
      <form onSubmit={submit} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="pw">New password</Label>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <Input
              id="pw"
              type="password"
              required
              value={pw}
              onChange={(e) => setPw(e.target.value)}
              placeholder="New password"
              className="pl-9"
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="confirm">Confirm password</Label>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <Input
              id="confirm"
              type="password"
              required
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="Re-enter password"
              className="pl-9"
            />
          </div>
          {mismatch && (
            <p className="text-xs text-risk-critical">
              Passwords do not match.
            </p>
          )}
        </div>
        <Button type="submit" className="w-full" loading={loading} disabled={mismatch}>
          {!loading && <KeyRound className="h-4 w-4" />}
          Update password
        </Button>
      </form>
    </AuthShell>
  );
}
