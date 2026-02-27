import type { VercelRequest, VercelResponse } from '@vercel/node';
import { requireAuth } from '../_lib/auth.js';
import { prisma } from '../_lib/db.js';
import { isValidDate, parseJsonBody, sendMethodNotAllowed, sendServerError } from '../_lib/http.js';
import { mapSkill } from '../_lib/mappers.js';

type HistoryEntry = {
  date: string;
  level: number;
};

type CreateSkillBody = {
  id?: string;
  name: string;
  level: number;
  history?: HistoryEntry[];
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const user = await requireAuth(req, res);
    if (!user) return;

    if (req.method === 'GET') {
      const skills = await prisma.skill.findMany({
        include: { history: true },
        orderBy: { createdAt: 'desc' },
      });
      return res.status(200).json(skills.map(mapSkill));
    }

    if (req.method === 'POST') {
      const body = parseJsonBody<CreateSkillBody>(req);

      if (!body.name?.trim()) {
        return res.status(400).json({ error: 'name is required' });
      }
      if (typeof body.level !== 'number' || body.level < 1 || body.level > 5) {
        return res.status(400).json({ error: 'level must be between 1 and 5' });
      }

      const history = (body.history?.length ? body.history : [{ date: new Date().toISOString(), level: body.level }])
        .filter((entry) => isValidDate(entry.date) && entry.level >= 1 && entry.level <= 5)
        .map((entry) => ({
          date: new Date(entry.date),
          level: entry.level,
        }));

      const created = await prisma.skill.create({
        data: {
          ...(body.id ? { id: body.id } : {}),
          name: body.name.trim(),
          level: body.level,
          history: {
            create: history,
          },
        },
        include: { history: true },
      });

      return res.status(201).json(mapSkill(created));
    }

    return sendMethodNotAllowed(res, ['GET', 'POST']);
  } catch (error) {
    return sendServerError(res, error);
  }
}
