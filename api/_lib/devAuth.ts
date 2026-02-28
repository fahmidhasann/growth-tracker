import type { VercelRequest } from '@vercel/node';

export function isDevAuthBypassEnabled(req?: VercelRequest) {
  const runtimeEnv = process.env.VERCEL_ENV ?? process.env.NODE_ENV ?? 'development';
  const host = req?.headers.host?.toLowerCase() ?? '';
  const isLocalHost = host.startsWith('localhost:') || host.startsWith('127.0.0.1:');
  const bypassFromEnv = process.env.DEV_AUTH_BYPASS?.toLowerCase() === 'true';
  return runtimeEnv !== 'production' && (bypassFromEnv || isLocalHost);
}

export function getDevBypassUser() {
  return {
    id: 'local-dev-user',
    email: process.env.DEV_AUTH_EMAIL?.trim().toLowerCase() || 'local-dev@growth-tracker.local',
  };
}