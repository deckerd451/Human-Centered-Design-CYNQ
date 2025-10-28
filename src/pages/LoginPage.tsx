import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lightbulb, Loader2, Mail, CheckCircle } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import NeuralBackground from '@/components/NeuralBackground';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Toaster, toast } from 'sonner';
const cardVariants = {
  initial: { opacity: 0, y: 20, scale: 0.98 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: -20, scale: 0.98 },
};
const emailSchema = z.object({
  email: z.string().email("Please enter a valid email address."),
});
type EmailFormData = z.infer<typeof emailSchema>;
const DisconnectedLogin = () => {
  const sendMagicLink = useAuthStore((s) => s.sendMagicLink);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<EmailFormData>({
    resolver: zodResolver(emailSchema),
  });
  const onSubmit: SubmitHandler<EmailFormData> = async (data) => {
    try {
      await sendMagicLink(data.email);
    } catch (error) {
      toast.error("Failed to send magic link. Please try again.");
    }
  };
  return (
    <motion.div key="disconnected" variants={cardVariants} initial="initial" animate="animate" exit="exit" className="w-full">
      <CardHeader className="text-center">
        <CardTitle className="text-3xl font-bold">Innovation Engine</CardTitle>
        <CardDescription>Sign in with a magic link. No passwords needed.</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="email" className="sr-only">Email</Label>
            <Input id="email" type="email" placeholder="Enter your email address" {...register('email')} />
            {errors.email && <p className="text-sm text-red-500 mt-2">{errors.email.message}</p>}
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full font-semibold text-base py-6" disabled={isSubmitting}>
            {isSubmitting ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Mail className="mr-2 h-5 w-5" />}
            Send Magic Link
          </Button>
        </CardFooter>
      </form>
    </motion.div>
  );
};
const AwaitingMagicLink = () => (
  <motion.div key="awaiting" variants={cardVariants} initial="initial" animate="animate" exit="exit" className="w-full flex flex-col items-center justify-center text-center p-6">
    <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
    <h2 className="text-2xl font-semibold">Check your inbox!</h2>
    <p className="text-muted-foreground mt-2">
      We've sent a magic link to your email address. Click the link to sign in.
    </p>
  </motion.div>
);
export function LoginPage() {
  const authState = useAuthStore((s) => s.authState);
  const navigate = useNavigate();
  useEffect(() => {
    if (authState === 'connected') {
      navigate('/');
    }
  }, [authState, navigate]);
  return (
    <main className="relative flex items-center justify-center min-h-screen bg-background overflow-hidden p-4">
      <Toaster />
      <NeuralBackground />
      <Card className="relative z-10 w-full max-w-md mx-auto shadow-xl rounded-2xl overflow-hidden border-border/50 bg-card/80 backdrop-blur-sm">
        <div className="min-h-[420px] flex items-center justify-center p-6 md:p-8">
          <AnimatePresence mode="wait">
            {authState === 'awaitingMagicLink' ? <AwaitingMagicLink /> : <DisconnectedLogin />}
          </AnimatePresence>
        </div>
      </Card>
    </main>
  );
}