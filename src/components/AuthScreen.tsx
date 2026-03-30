import { useEffect, useState, type FormEvent } from 'react';
import { AlertCircle, Trophy } from 'lucide-react';
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
    const params = new URLSearchParams(window.location.search);
    const authError = params.get('authError');
    const errorMessages: Record<string, string> = {
      oauth_state_invalid: 'The Google sign-in session expired. Please try again.',
      oauth_token_exchange_failed: 'Google sign-in could not be completed. Please try again.',
      oauth_missing_id_token: 'Google sign-in returned incomplete data. Please try again.',
      oauth_token_validation_failed: 'Google sign-in could not be verified. Please try again.',
      oauth_identity_invalid: 'The selected Google account could not be verified.',
      owner_account_mismatch: 'That Google account does not match the existing owner account.',
      google_account_mismatch: 'This account is already linked to another Google profile.',
    };

    if (authError && errorMessages[authError]) {
      setError(errorMessages[authError]);
      params.delete('authError');
      const nextQuery = params.toString();
      const nextUrl = `${window.location.pathname}${nextQuery ? `?${nextQuery}` : ''}${window.location.hash}`;
      window.history.replaceState({}, '', nextUrl);
    }

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
        setError((current) => current ?? 'Unable to load authentication settings.');
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
      <div className="gt-app-shell flex min-h-screen items-center justify-center px-4">
        <div className="relative">
          <div className="h-12 w-12 rounded-full border-2 border-[var(--border-subtle)]" />
          <div className="absolute inset-0 h-12 w-12 animate-spin rounded-full border-2 border-transparent border-t-[var(--accent-strong)]" />
        </div>
      </div>
    );
  }

  return (
    <div className="gt-app-shell relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-8 sm:p-6">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute left-1/2 top-1/2 h-[30rem] w-[30rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--app-bg-accent)] blur-3xl" />
        <div className="absolute right-[12%] top-[18%] h-56 w-56 rounded-full bg-[var(--app-bg-warm)] blur-3xl" />
      </div>

      <div className="gt-panel-strong relative w-full max-w-md space-y-6 rounded-[2rem] p-6 shadow-[var(--shadow-panel)] sm:p-8">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-[1.25rem] bg-amber-500/12 text-[var(--warning)]">
            <Trophy className="h-7 w-7" />
          </div>
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-[var(--text-primary)]">Growth Tracker</h1>
            <p className="mt-1 text-sm text-[var(--text-muted)]">Your personal growth journal</p>
          </div>
          <p className="text-sm leading-relaxed text-[var(--text-secondary)]">
            {hasUsers ? 'Sign in to access your tracker.' : 'Create your owner account to secure your tracker.'}
          </p>
        </div>

        <div className="rounded-[1.5rem] border border-[var(--border-subtle)] bg-[var(--surface-soft)] px-4 py-3">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-[var(--text-soft)]">
            Access
          </p>
          <p className="mt-2 text-sm leading-relaxed text-[var(--text-muted)]">
            {hasUsers
              ? 'Use your owner account to continue. Google sign-in appears automatically when configured.'
              : 'Your first account becomes the owner account for this tracker.'}
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
            hint={!hasUsers ? 'Use at least 8 characters for the owner account password.' : undefined}
          />

          {error ? (
            <div className="rounded-2xl border border-red-500/18 bg-red-500/8 px-4 py-3 text-sm text-[var(--danger)]">
              <div className="flex items-start gap-3">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            </div>
          ) : null}

          <Button variant="primary" size="lg" type="submit" className="w-full" disabled={submitting}>
            {submitting ? 'Please wait...' : hasUsers ? 'Sign In' : 'Create Account'}
          </Button>

          {googleOAuthEnabled && (
            <Button
              variant="secondary"
              type="button"
              size="lg"
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
