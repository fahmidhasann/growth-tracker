import type { VercelRequest, VercelResponse } from '@vercel/node';
import { requireAuth } from '../_lib/auth.js';
import { prisma } from '../_lib/db.js';
import { isValidDate, parseJsonBody, sendMethodNotAllowed, sendServerError } from '../_lib/http.js';
import { mapMilestone } from '../_lib/mappers.js';

type CreateMilestoneBody = {
  id?: string;
  title: string;
  description?: string;
  date: string;
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const user = await requireAuth(req, res);
    if (!user) return;

    if (req.method === 'GET') {
      const milestones = await prisma.milestone.findMany({
        orderBy: { date: 'desc' },
      });
      return res.status(200).json(milestones.map(mapMilestone));
    }

    if (req.method === 'POST') {
      const body = parseJsonBody<CreateMilestoneBody>(req);

      if (!body.title?.trim()) {
        return res.status(400).json({ error: 'title is required' });
      }
      if (!body.date || !isValidDate(body.date)) {
        return res.status(400).json({ error: 'Valid date is required' });
      }

      const created = await prisma.milestone.create({
        data: {
          ...(body.id ? { id: body.id } : {}),
          title: body.title.trim(),
          description: body.description?.trim() || null,
          date: new Date(body.date),
        },
      });

      return res.status(201).json(mapMilestone(created));
    }

    return sendMethodNotAllowed(res, ['GET', 'POST']);
  } catch (error) {
    return sendServerError(res, error);
  }
}
