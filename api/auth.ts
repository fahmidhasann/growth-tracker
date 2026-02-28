import type { VercelRequest, VercelResponse } from '@vercel/node';
import { compare, hash } from 'bcryptjs';
import { randomBytes } from 'node:crypto';
import { createSession, destroySession, getCurrentUser } from './_lib/auth.js';
import { getDevBypassUser, isDevAuthBypassEnabled } from './_lib/devAuth.js';
import { prisma } from './_lib/db.js';
import { parseJsonBody, sendMethodNotAllowed, sendServerError } from './_lib/http.js';

type AuthBody = {
  email?: string;
  password?: string;
};

const OAUTH_STATE_COOKIE = 'growth_tracker_oauth_state';

function parseCookies(cookieHeader?: string) {
  if (!cookieHeader) return {} as Record<string, string>;
  return cookieHeader.split(';').reduce<Record<string, string>>((acc, pair) => {
    const [rawName, ...rawValue] = pair.trim().split('=');
    if (!rawName) return acc;
    acc[decodeURIComponent(rawName)] = decodeURIComponent(rawValue.join('='));
    return acc;
  }, {});
}

function resolveAppUrl(req: VercelRequest) {
  if (process.env.APP_URL?.trim()) return process.env.APP_URL.trim().replace(/\/$/, '');
  const host = req.headers.host;
  if (!host) return '';
  return `https://${host}`;
}

function getGoogleConfig(req: VercelRequest) {
  const googleOAuthEnabled = process.env.ENABLE_GOOGLE_OAUTH?.toLowerCase() === 'true';
  const clientId = process.env.GOOGLE_CLIENT_ID?.trim() ?? '';
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET?.trim() ?? '';
  const appUrl = resolveAppUrl(req);
  const redirectUri = appUrl ? `${appUrl}/api/auth?action=google_callback` : '';

  return {
    enabled: Boolean(googleOAuthEnabled && clientId && clientSecret && appUrl),
    clientId,
    clientSecret,
    redirectUri,
    appUrl,
  };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const action = (req.query.action as string | undefined)?.toLowerCase();

    if (action === 'bootstrap') {
      if (req.method !== 'GET') return sendMethodNotAllowed(res, ['GET']);
      const usersCount = await prisma.user.count();
      const google = getGoogleConfig(req);
      return res.status(200).json({
        hasUsers: usersCount > 0,
        googleOAuthEnabled: google.enabled,
      });
    }

    if (action === 'me') {
      if (req.method !== 'GET') return sendMethodNotAllowed(res, ['GET']);
      if (isDevAuthBypassEnabled(req)) {
        return res.status(200).json({ user: getDevBypassUser() });
      }
      const user = await getCurrentUser(req);
      return res.status(200).json({
        user: user
          ? {
              id: user.id,
              email: user.email,
            }
          : null,
      });
    }

    if (action === 'logout') {
      if (req.method !== 'POST') return sendMethodNotAllowed(res, ['POST']);
      await destroySession(req, res);
      return res.status(200).json({ success: true });
    }

    if (action === 'register') {
      if (req.method !== 'POST') return sendMethodNotAllowed(res, ['POST']);

      const body = parseJsonBody<AuthBody>(req);
      const email = body.email?.trim().toLowerCase();
      const password = body.password ?? '';

      if (!email || !email.includes('@')) {
        return res.status(400).json({ error: 'Valid email is required' });
      }
      if (password.length < 8) {
        return res.status(400).json({ error: 'Password must be at least 8 characters' });
      }

      const usersCount = await prisma.user.count();
      if (usersCount > 0) {
        return res.status(403).json({ error: 'Registration is disabled after owner account is created' });
      }

      const passwordHash = await hash(password, 12);
      const user = await prisma.user.create({
        data: {
          email,
          passwordHash,
        },
      });

      await createSession(user.id, res);

      return res.status(201).json({
        id: user.id,
        email: user.email,
      });
    }

    if (action === 'login') {
      if (req.method !== 'POST') return sendMethodNotAllowed(res, ['POST']);

      const body = parseJsonBody<AuthBody>(req);
      const email = body.email?.trim().toLowerCase();
      const password = body.password ?? '';

      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
      }

      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
      if (!user.passwordHash) {
        return res.status(401).json({ error: 'Use Google sign-in for this account' });
      }

      const isValid = await compare(password, user.passwordHash);
      if (!isValid) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      await createSession(user.id, res);

      return res.status(200).json({
        id: user.id,
        email: user.email,
      });
    }

    if (action === 'google_start') {
      if (req.method !== 'GET') return sendMethodNotAllowed(res, ['GET']);

      const google = getGoogleConfig(req);
      if (!google.enabled) {
        return res.status(400).json({ error: 'Google OAuth is not configured' });
      }

      const state = randomBytes(24).toString('hex');
      const encodedState = encodeURIComponent(state);
      const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
      authUrl.searchParams.set('client_id', google.clientId);
      authUrl.searchParams.set('redirect_uri', google.redirectUri);
      authUrl.searchParams.set('response_type', 'code');
      authUrl.searchParams.set('scope', 'openid email profile');
      authUrl.searchParams.set('state', state);
      authUrl.searchParams.set('prompt', 'select_account');

      res.setHeader(
        'Set-Cookie',
        `${OAUTH_STATE_COOKIE}=${encodedState}; Path=/; HttpOnly; SameSite=Lax; Secure; Max-Age=600`
      );
      res.setHeader('Location', authUrl.toString());
      return res.status(302).end();
    }

    if (action === 'google_callback') {
      if (req.method !== 'GET') return sendMethodNotAllowed(res, ['GET']);

      const google = getGoogleConfig(req);
      if (!google.enabled) {
        return res.status(400).json({ error: 'Google OAuth is not configured' });
      }

      const code = (req.query.code as string | undefined) ?? '';
      const state = (req.query.state as string | undefined) ?? '';
      const cookies = parseCookies(req.headers.cookie);
      const expectedState = cookies[OAUTH_STATE_COOKIE] ?? '';

      res.setHeader('Set-Cookie', `${OAUTH_STATE_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Secure; Max-Age=0`);

      if (!code || !state || !expectedState || state !== expectedState) {
        res.setHeader('Location', `${google.appUrl}/?authError=oauth_state_invalid`);
        return res.status(302).end();
      }

      const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          code,
          client_id: google.clientId,
          client_secret: google.clientSecret,
          redirect_uri: google.redirectUri,
          grant_type: 'authorization_code',
        }),
      });

      if (!tokenResponse.ok) {
        res.setHeader('Location', `${google.appUrl}/?authError=oauth_token_exchange_failed`);
        return res.status(302).end();
      }

      const tokenPayload = (await tokenResponse.json()) as {
        id_token?: string;
      };

      if (!tokenPayload.id_token) {
        res.setHeader('Location', `${google.appUrl}/?authError=oauth_missing_id_token`);
        return res.status(302).end();
      }

      const infoResponse = await fetch(
        `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(tokenPayload.id_token)}`
      );

      if (!infoResponse.ok) {
        res.setHeader('Location', `${google.appUrl}/?authError=oauth_token_validation_failed`);
        return res.status(302).end();
      }

      const info = (await infoResponse.json()) as {
        sub?: string;
        email?: string;
        email_verified?: string;
        aud?: string;
        name?: string;
        picture?: string;
      };

      const email = info.email?.toLowerCase().trim() ?? '';
      if (!info.sub || !email || info.email_verified !== 'true' || info.aud !== google.clientId) {
        res.setHeader('Location', `${google.appUrl}/?authError=oauth_identity_invalid`);
        return res.status(302).end();
      }

      const usersCount = await prisma.user.count();
      let user = await prisma.user.findFirst({
        where: {
          OR: [{ googleSub: info.sub }, { email }],
        },
      });

      if (!user) {
        if (usersCount > 0) {
          res.setHeader('Location', `${google.appUrl}/?authError=owner_account_mismatch`);
          return res.status(302).end();
        }

        user = await prisma.user.create({
          data: {
            email,
            googleSub: info.sub,
            name: info.name ?? null,
            avatarUrl: info.picture ?? null,
            passwordHash: await hash(randomBytes(16).toString('hex'), 12),
          },
        });
      } else {
        if (user.googleSub && user.googleSub !== info.sub) {
          res.setHeader('Location', `${google.appUrl}/?authError=google_account_mismatch`);
          return res.status(302).end();
        }

        user = await prisma.user.update({
          where: { id: user.id },
          data: {
            googleSub: user.googleSub ?? info.sub,
            name: info.name ?? user.name,
            avatarUrl: info.picture ?? user.avatarUrl,
          },
        });
      }

      await createSession(user.id, res);
      res.setHeader('Location', `${google.appUrl}/`);
      return res.status(302).end();
    }

    return res.status(400).json({ error: 'Invalid auth action' });
  } catch (error) {
    return sendServerError(res, error);
  }
}
