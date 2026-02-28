import type { VercelRequest, VercelResponse } from '@vercel/node';
import { requireAuth } from '../_lib/auth.js';
import { getDevBypassUser, isDevAuthBypassEnabled } from '../_lib/devAuth.js';
import { prisma } from '../_lib/db.js';
import { isValidDate, parseJsonBody, sendMethodNotAllowed, sendServerError } from '../_lib/http.js';
import { mapMilestone } from '../_lib/mappers.js';

type UpdateMilestoneBody = {
  title?: string;
  description?: string;
  date?: string;
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
      const body = parseJsonBody<UpdateMilestoneBody>(req);
      const data: Record<string, unknown> = {};

      if (body.title !== undefined) data.title = body.title.trim();
      if (body.description !== undefined) data.description = body.description.trim() || null;
      if (body.date !== undefined) {
        if (!isValidDate(body.date)) {
          return res.status(400).json({ error: 'date must be valid' });
        }
        data.date = new Date(body.date);
      }

      const updated = await prisma.milestone.update({
        where: { id },
        data,
      });

      return res.status(200).json(mapMilestone(updated));
    }

    if (req.method === 'DELETE') {
      await prisma.milestone.delete({ where: { id } });
      return res.status(200).json({ success: true });
    }

    return sendMethodNotAllowed(res, ['PATCH', 'DELETE']);
  } catch (error) {
    return sendServerError(res, error);
  }
}
