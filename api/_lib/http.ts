import type { VercelRequest, VercelResponse } from '@vercel/node';

export function sendMethodNotAllowed(res: VercelResponse, allowed: string[]) {
  res.setHeader('Allow', allowed.join(', '));
  return res.status(405).json({ error: 'Method not allowed' });
}

export function sendServerError(res: VercelResponse, error: unknown) {
  const message = error instanceof Error ? error.message : 'Unexpected server error';
  return res.status(500).json({ error: message });
}

export function parseJsonBody<T>(req: VercelRequest): T {
  if (!req.body) {
    return {} as T;
  }

  if (typeof req.body === 'string') {
    return JSON.parse(req.body) as T;
  }

  return req.body as T;
}

export function isValidDate(value: string) {
  return !Number.isNaN(new Date(value).getTime());
}
