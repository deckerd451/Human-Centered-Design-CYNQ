import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useTheme } from "@/hooks/use-theme";
import { Moon, Sun, Github, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/authStore";
import { useState } from "react";
export function SettingsPage() {
  const { isDark, toggleTheme } = useTheme();
  const user = useAuthStore((s) => s.user);
  const connectGitHub = useAuthStore((s) => s.connectGitHub);
  const disconnectGitHub = useAuthStore((s) => s.disconnectGitHub);
  const [isConnecting, setIsConnecting] = useState(false);
  const handleConnect = async () => {
    setIsConnecting(true);
    await connectGitHub();
    setIsConnecting(false);
  };
  return (
    <AppLayout container>
      <div className="space-y-8 max-w-3xl mx-auto">
        <header>
          <h1 className="text-4xl font-bold tracking-tight">Settings</h1>
          <p className="text-lg text-muted-foreground">Manage your application and account settings.</p>
        </header>
        <Card>
          <CardHeader>
            <CardTitle>Appearance</CardTitle>
            <CardDescription>Customize the look and feel of the application.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <Label htmlFor="dark-mode" className="text-base">Dark Mode</Label>
                <p className="text-sm text-muted-foreground">
                  Toggle between light and dark themes.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Sun className={`size-5 transition-all ${isDark ? 'text-muted-foreground' : 'text-yellow-500'}`} />
                <Switch
                  id="dark-mode"
                  checked={isDark}
                  onCheckedChange={toggleTheme}
                  aria-label="Toggle dark mode"
                />
                <Moon className={`size-5 transition-all ${isDark ? 'text-blue-400' : 'text-muted-foreground'}`} />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Integrations</CardTitle>
            <CardDescription>Connect your account to other services.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="flex items-center gap-4">
                <Github className="h-8 w-8" />
                <div>
                  <Label className="text-base">GitHub</Label>
                  <p className="text-sm text-muted-foreground">
                    {user?.githubUsername ? `Connected as @${user.githubUsername}` : "Display your GitHub stats on your profile."}
                  </p>
                </div>
              </div>
              {user?.githubUsername ? (
                <Button variant="destructive" onClick={disconnectGitHub}>Disconnect</Button>
              ) : (
                <Button onClick={handleConnect} disabled={isConnecting}>
                  {isConnecting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Connect
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
        <footer className="text-center text-sm text-muted-foreground pt-8">
            Built with ❤️ at Cloudflare
        </footer>
      </div>
    </AppLayout>
  );
}