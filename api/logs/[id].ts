import type { VercelRequest, VercelResponse } from '@vercel/node';
import { requireAuth } from '../_lib/auth.js';
import { getDevBypassUser, isDevAuthBypassEnabled } from '../_lib/devAuth.js';
import { prisma } from '../_lib/db.js';
import { isValidDate, parseJsonBody, sendMethodNotAllowed, sendServerError } from '../_lib/http.js';
import { mapLog } from '../_lib/mappers.js';

type UpdateLogBody = {
  date?: string;
  learned?: string;
  built?: string;
  challenges?: string;
  mood?: number;
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const id = req.query.id as string;
  if (!id) {
    return res.status(400).json({ error: 'id is required' });
  }

  try {
    const user = isDevAuthBypassEnabled(req) ? getDevBypassUser() : await requireAuth(req, res);
    if (!user) return;

    if (req.method === 'PATCH') {
      const body = parseJsonBody<UpdateLogBody>(req);
      const data: Record<string, unknown> = {};

      if (body.date !== undefined) {
        if (!isValidDate(body.date)) {
          return res.status(400).json({ error: 'date must be valid' });
        }
        data.date = new Date(body.date);
      }
      if (body.learned !== undefined) data.learned = body.learned.trim();
      if (body.built !== undefined) data.built = body.built.trim();
      if (body.challenges !== undefined) data.challenges = body.challenges.trim();
      if (body.mood !== undefined) {
        if (body.mood < 1 || body.mood > 5) {
          return res.status(400).json({ error: 'mood must be between 1 and 5' });
        }
        data.mood = body.mood;
      }

      const updated = await prisma.logEntry.update({
        where: { id },
        data,
      });

      return res.status(200).json(mapLog(updated));
    }

    if (req.method === 'DELETE') {
      await prisma.logEntry.delete({ where: { id } });
      return res.status(200).json({ success: true });
    }

    return sendMethodNotAllowed(res, ['PATCH', 'DELETE']);
  } catch (error) {
    return sendServerError(res, error);
  }
}
