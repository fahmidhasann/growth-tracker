import { useEffect, useState, type FormEvent } from 'react';
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
      <div className="min-h-screen bg-zinc-950 text-zinc-300 flex items-center justify-center">
        Loading authentication...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Growth Tracker</h1>
          <p className="text-zinc-400 text-sm mt-2">
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
