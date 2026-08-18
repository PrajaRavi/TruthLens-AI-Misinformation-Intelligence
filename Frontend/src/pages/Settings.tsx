import { useContext, useEffect, useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { Input, Label } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Switch } from "@/components/ui/Switch";
import { Avatar } from "@/components/ui/Avatar";
import { ThemeSelector } from "@/components/theme";
import { useToast } from "@/components/ui/Toast";
import { currentUser } from "@/data/mockData";
import { UserContext, useUser } from "@/context/counterContext";

export default function SettingsPage() {
  const { toast } = useToast();
  const {user}=useUser()
  const [name, setName] = useState(user?.name);
  const [email, setEmail] = useState(user?.email);
  const [notifs, setNotifs] = useState({
    completed: true,
    highRisk: true,
    sources: false,
  });
  const [privacy, setPrivacy] = useState({
    retain: true,
    share: false,
  });
  useEffect(()=>{
console.log(user)
setName(user?.name)
setEmail(user?.email)
  },[user])

  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        description="Manage your profile, appearance, notifications, and privacy preferences."
      />

      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="flex items-center gap-4">
            <Avatar name={name} className="h-16 w-16 text-lg" />
            <Button variant="outline" size="sm">
              Change Avatar
            </Button>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>
          <Button
            onClick={() =>
              toast({ type: "success", title: "Profile saved (demo)" })
            }
          >
            Save Changes
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
        </CardHeader>
        <CardContent>
          <ThemeSelector />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
        </CardHeader>
        <CardContent className="divide-y divide-border">
          <SettingRow
            title="Analysis completed"
            description="Get notified when an analysis finishes."
            checked={notifs.completed}
            onChange={(v) => setNotifs((n) => ({ ...n, completed: v }))}
          />
          <SettingRow
            title="High-risk alert"
            description="Alert me when content is flagged as high or critical risk."
            checked={notifs.highRisk}
            onChange={(v) => setNotifs((n) => ({ ...n, highRisk: v }))}
          />
          <SettingRow
            title="Source updates"
            description="Notify me when a cross-referenced source is updated."
            checked={notifs.sources}
            onChange={(v) => setNotifs((n) => ({ ...n, sources: v }))}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Privacy</CardTitle>
        </CardHeader>
        <CardContent className="divide-y divide-border">
          <SettingRow
            title="Retain analysis history"
            description="Keep past analyses stored in your account."
            checked={privacy.retain}
            onChange={(v) => setPrivacy((p) => ({ ...p, retain: v }))}
          />
          <SettingRow
            title="Contribute anonymized data"
            description="Help improve detection models with anonymized data."
            checked={privacy.share}
            onChange={(v) => setPrivacy((p) => ({ ...p, share: v }))}
          />
        </CardContent>
      </Card>
    </div>
  );
}

function SettingRow({
  title,
  description,
  checked,
  onChange,
}: {
  title: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-4 first:pt-0 last:pb-0">
      <div>
        <p className="text-sm font-medium text-foreground">{title}</p>
        <p className="text-sm text-muted">{description}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} label={title} />
    </div>
  );
}
