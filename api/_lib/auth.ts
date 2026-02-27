import type { VercelRequest, VercelResponse } from '@vercel/node';
import { randomBytes } from 'node:crypto';
import { prisma } from './db.js';

const SESSION_COOKIE = 'growth_tracker_session';
const SESSION_TTL_DAYS = 30;

function parseCookies(cookieHeader?: string) {
  if (!cookieHeader) return {} as Record<string, string>;
  return cookieHeader.split(';').reduce<Record<string, string>>((acc, pair) => {
    const [rawName, ...rawValue] = pair.trim().split('=');
    if (!rawName) return acc;
    acc[decodeURIComponent(rawName)] = decodeURIComponent(rawValue.join('='));
    return acc;
  }, {});
}

function buildSessionCookie(token: string, expiresAt: Date) {
  const maxAge = Math.max(0, Math.floor((expiresAt.getTime() - Date.now()) / 1000));
  return `${SESSION_COOKIE}=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Lax; Secure; Max-Age=${maxAge}`;
}

export function clearSessionCookie(res: VercelResponse) {
  res.setHeader('Set-Cookie', `${SESSION_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Secure; Max-Age=0`);
}

export async function createSession(userId: string, res: VercelResponse) {
  const token = randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + SESSION_TTL_DAYS * 24 * 60 * 60 * 1000);

  await prisma.session.create({
    data: {
      token,
      userId,
      expiresAt,
    },
  });

  res.setHeader('Set-Cookie', buildSessionCookie(token, expiresAt));
}

export async function getCurrentUser(req: VercelRequest) {
  const cookies = parseCookies(req.headers.cookie);
  const token = cookies[SESSION_COOKIE];
  if (!token) return null;

  const session = await prisma.session.findUnique({
    where: { token },
    include: { user: true },
  });

  if (!session) return null;
  if (session.expiresAt.getTime() < Date.now()) {
    await prisma.session.delete({ where: { id: session.id } }).catch(() => undefined);
    return null;
  }

  return session.user;
}

export async function destroySession(req: VercelRequest, res: VercelResponse) {
  const cookies = parseCookies(req.headers.cookie);
  const token = cookies[SESSION_COOKIE];
  if (token) {
    await prisma.session.deleteMany({ where: { token } });
  }
  clearSessionCookie(res);
}

export async function requireAuth(req: VercelRequest, res: VercelResponse) {
  const user = await getCurrentUser(req);
  if (!user) {
    res.status(401).json({ error: 'Unauthorized' });
    return null;
  }
  return user;
}
