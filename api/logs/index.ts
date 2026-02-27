import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from '../_lib/db';
import { isValidDate, parseJsonBody, sendMethodNotAllowed, sendServerError } from '../_lib/http';
import { mapLog } from '../_lib/mappers';

type CreateLogBody = {
  id?: string;
  date: string;
  learned: string;
  built: string;
  challenges: string;
  mood: number;
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method === 'GET') {
      const logs = await prisma.logEntry.findMany({
        orderBy: { date: 'desc' },
      });
      return res.status(200).json(logs.map(mapLog));
    }

    if (req.method === 'POST') {
      const body = parseJsonBody<CreateLogBody>(req);

      if (!body.date || !isValidDate(body.date)) {
        return res.status(400).json({ error: 'Valid date is required' });
      }
      if (!body.learned?.trim() || !body.built?.trim() || !body.challenges?.trim()) {
        return res.status(400).json({ error: 'learned, built, and challenges are required' });
      }
      if (typeof body.mood !== 'number' || body.mood < 1 || body.mood > 5) {
        return res.status(400).json({ error: 'mood must be between 1 and 5' });
      }

      const created = await prisma.logEntry.create({
        data: {
          ...(body.id ? { id: body.id } : {}),
          date: new Date(body.date),
          learned: body.learned.trim(),
          built: body.built.trim(),
          challenges: body.challenges.trim(),
          mood: body.mood,
        },
      });

      return res.status(201).json(mapLog(created));
    }

    return sendMethodNotAllowed(res, ['GET', 'POST']);
  } catch (error) {
    return sendServerError(res, error);
  }
}
