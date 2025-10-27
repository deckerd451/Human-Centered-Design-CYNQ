import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Github, Loader2 } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import NeuralBackground from '@/components/NeuralBackground';
const cardVariants = {
  initial: { opacity: 0, y: 20, scale: 0.98 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: -20, scale: 0.98 },
};
const DisconnectedLogin = () => {
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
const ConnectingLogin = () => (
  <motion.div key="connecting" variants={cardVariants} initial="initial" animate="animate" exit="exit" className="w-full flex flex-col items-center justify-center text-center">
    <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
    <p className="text-lg font-medium text-foreground">Connecting to GitHub...</p>
    <p className="text-muted-foreground">Please wait while we securely authorize.</p>
  </motion.div>
);
export function LoginPage() {
  const authState = useAuthStore((s) => s.authState);
  const navigate = useNavigate();
  useEffect(() => {
    if (authState === 'connected') {
      navigate('/dashboard');
    }
  }, [authState, navigate]);
  return (
    <main className="relative flex items-center justify-center min-h-screen bg-background overflow-hidden p-4">
      <NeuralBackground />
      <Card className="relative z-10 w-full max-w-md mx-auto shadow-xl rounded-2xl overflow-hidden border-border/50 bg-card/80 backdrop-blur-sm">
        <div className="min-h-[420px] flex items-center justify-center p-6 md:p-8">
          <AnimatePresence mode="wait">
            {authState === 'connecting' ? <ConnectingLogin /> : <DisconnectedLogin />}
          </AnimatePresence>
        </div>
      </Card>
    </main>
  );
}