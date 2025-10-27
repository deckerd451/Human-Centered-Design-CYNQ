import { Github, Loader2 } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { ThemeToggle } from '@/components/ThemeToggle';
const cardVariants = {
  initial: { opacity: 0, y: 20, scale: 0.98 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: -20, scale: 0.98 },
};
const DisconnectedState = () => {
  const connect = useAuthStore((s) => s.connect);
  return (
    <motion.div key="disconnected" variants={cardVariants} initial="initial" animate="animate" exit="exit" className="w-full">
      <CardHeader className="text-center">
        <CardTitle className="text-3xl font-bold">CodeStream</CardTitle>
        <CardDescription>Seamless GitHub Integration</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-center text-muted-foreground mb-6">
          Connect your GitHub account to securely visualize your profile information.
        </p>
      </CardContent>
      <CardFooter>
        <Button onClick={connect} className="w-full font-semibold text-base py-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
          <Github className="mr-2 h-5 w-5" />
          Connect with GitHub
        </Button>
      </CardFooter>
    </motion.div>
  );
};
const ConnectingState = () => (
  <motion.div key="connecting" variants={cardVariants} initial="initial" animate="animate" exit="exit" className="w-full flex flex-col items-center justify-center text-center">
    <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
    <p className="text-lg font-medium text-foreground">Connecting to GitHub...</p>
    <p className="text-muted-foreground">Please wait while we securely authorize.</p>
  </motion.div>
);
const ConnectedState = () => {
  const user = useAuthStore((s) => s.user);
  const disconnect = useAuthStore((s) => s.disconnect);
  if (!user) return null;
  return (
    <motion.div key="connected" variants={cardVariants} initial="initial" animate="animate" exit="exit" className="w-full">
      <CardHeader className="flex flex-col items-center text-center space-y-4">
        <Avatar className="h-24 w-24 border-4 border-background shadow-lg">
          <AvatarImage src={user.avatarUrl} alt={user.name} />
          <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <div>
          <CardTitle className="text-2xl">{user.name}</CardTitle>
          <CardDescription className="text-lg text-muted-foreground">@{user.username}</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="text-center space-y-6">
        <p className="text-foreground/90">{user.bio}</p>
        <Separator />
        <div className="flex justify-around">
          <div className="text-center">
            <p className="text-2xl font-bold">{user.repos}</p>
            <p className="text-sm text-muted-foreground">Repositories</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold">{user.followers.toLocaleString()}</p>
            <p className="text-sm text-muted-foreground">Followers</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold">{user.following.toLocaleString()}</p>
            <p className="text-sm text-muted-foreground">Following</p>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={disconnect} variant="outline" className="w-full font-semibold text-base py-6">
          Disconnect
        </Button>
      </CardFooter>
    </motion.div>
  );
};
export function HomePage() {
  const authState = useAuthStore((s) => s.authState);
  return (
    <div className="min-h-screen w-full bg-gradient-subtle">
      <ThemeToggle className="fixed top-4 right-4" />
      <main className="min-h-screen flex flex-col items-center justify-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="py-12">
            <Card className="w-full max-w-md mx-auto shadow-xl rounded-2xl overflow-hidden border-border/50">
              <div className="min-h-[480px] flex items-center justify-center p-6 md:p-8">
                <AnimatePresence mode="wait">
                  {authState === 'disconnected' && <DisconnectedState />}
                  {authState === 'connecting' && <ConnectingState />}
                  {authState === 'connected' && <ConnectedState />}
                </AnimatePresence>
              </div>
            </Card>
          </div>
        </div>
      </main>
      <footer className="fixed bottom-4 w-full text-center text-muted-foreground text-sm">
        Built with ❤️ at Cloudflare
      </footer>
    </div>
  );
}