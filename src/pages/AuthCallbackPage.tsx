import { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { Loader2, AlertTriangle } from 'lucide-react';
export function AuthCallbackPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const verifyTokenAndLogin = useAuthStore((s) => s.verifyTokenAndLogin);
  const authState = useAuthStore((s) => s.authState);
  useEffect(() => {
    const token = searchParams.get('token');
    if (token) {
      verifyTokenAndLogin(token).catch(() => {
        // Error is handled in the store, which sets state to 'disconnected'
      });
    } else {
      // No token, redirect to login
      navigate('/login');
    }
  }, [searchParams, verifyTokenAndLogin, navigate]);
  useEffect(() => {
    if (authState === 'connected') {
      navigate('/');
    }
  }, [authState, navigate]);
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground">
      {authState === 'authenticating' && (
        <>
          <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
          <h1 className="text-2xl font-semibold">Verifying your identity...</h1>
          <p className="text-muted-foreground">Please wait a moment.</p>
        </>
      )}
      {authState === 'disconnected' && (
        <>
          <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
          <h1 className="text-2xl font-semibold">Authentication Failed</h1>
          <p className="text-muted-foreground">The magic link is invalid or has expired.</p>
          <button onClick={() => navigate('/login')} className="mt-4 text-primary hover:underline">
            Return to Login
          </button>
        </>
      )}
    </div>
  );
}