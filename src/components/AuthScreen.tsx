import { useEffect, useState, type FormEvent } from 'react';
import { Trophy } from 'lucide-react';
import { Button } from './ui/Button';
import { Input } from './ui/Input';

type AuthScreenProps = {
  onAuthenticated: () => void;
};

export function AuthScreen({ onAuthenticated }: AuthScreenProps) {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [hasUsers, setHasUsers] = useState(true);
  const [googleOAuthEnabled, setGoogleOAuthEnabled] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const bootstrap = async () => {
      try {
        const response = await fetch('/api/auth?action=bootstrap');
        const payload = (await response.json()) as {
          hasUsers: boolean;
          googleOAuthEnabled?: boolean;
        };
        setHasUsers(payload.hasUsers);
        setGoogleOAuthEnabled(Boolean(payload.googleOAuthEnabled));
      } catch {
        setError('Unable to load authentication settings.');
      } finally {
        setLoading(false);
      }
    };

    void bootstrap();
  }, []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const endpoint = hasUsers ? '/api/auth?action=login' : '/api/auth?action=register';
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({ error: 'Authentication failed' }));
        throw new Error(payload.error ?? 'Authentication failed');
      }

      onAuthenticated();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="relative">
          <div className="w-10 h-10 rounded-full border-2 border-zinc-800" />
          <div className="absolute inset-0 w-10 h-10 rounded-full border-2 border-transparent border-t-zinc-400 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-amber-500/3 blur-3xl" />
        <div className="absolute top-1/4 right-1/4 w-64 h-64 rounded-full bg-blue-500/3 blur-3xl" />
      </div>

      <div className="w-full max-w-md rounded-2xl border border-zinc-700/50 bg-zinc-900/60 p-8 space-y-6 shadow-2xl shadow-zinc-950/50 relative">
        {/* Brand header */}
        <div className="flex flex-col items-center text-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/15 border border-amber-500/25 flex items-center justify-center">
            <Trophy className="w-7 h-7 text-amber-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-zinc-100">Growth Tracker</h1>
            <p className="text-zinc-500 text-sm mt-1">Your personal growth journal</p>
          </div>
          <p className="text-zinc-400 text-sm">
            {hasUsers ? 'Sign in to access your tracker.' : 'Create your owner account to secure your tracker.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
          />
          <Input
            label="Password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 8 characters"
          />

          {error && <p className="text-sm text-red-400">{error}</p>}

          <Button variant="primary" type="submit" className="w-full" disabled={submitting}>
            {submitting ? 'Please wait...' : hasUsers ? 'Sign In' : 'Create Account'}
          </Button>

          {googleOAuthEnabled && (
            <Button
              variant="secondary"
              type="button"
              className="w-full"
              onClick={() => {
                window.location.href = '/api/auth?action=google_start';
              }}
            >
              Continue with Google
            </Button>
          )}
        </form>
      </div>
    </div>
  );
}
