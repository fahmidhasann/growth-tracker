import type { VercelRequest, VercelResponse } from '@vercel/node';
import { requireAuth } from '../_lib/auth.js';
import { prisma } from '../_lib/db.js';
import { parseJsonBody, sendMethodNotAllowed, sendServerError } from '../_lib/http.js';
import { mapSkill } from '../_lib/mappers.js';

type UpdateSkillBody = {
  name?: string;
  level?: number;
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const id = req.query.id as string;
  if (!id) {
    return res.status(400).json({ error: 'id is required' });
  }

  try {
    const user = await requireAuth(req, res);
    if (!user) return;

    if (req.method === 'PATCH') {
      const body = parseJsonBody<UpdateSkillBody>(req);

      const current = await prisma.skill.findUnique({
        where: { id },
        include: { history: true },
      });

      if (!current) {
        return res.status(404).json({ error: 'Skill not found' });
      }

      if (body.level !== undefined && (body.level < 1 || body.level > 5)) {
        return res.status(400).json({ error: 'level must be between 1 and 5' });
      }

      const updated = await prisma.skill.update({
        where: { id },
        data: {
          ...(body.name !== undefined ? { name: body.name.trim() } : {}),
          ...(body.level !== undefined ? { level: body.level } : {}),
          ...(body.level !== undefined && body.level !== current.level
            ? {
                history: {
                  create: {
                    level: body.level,
                    date: new Date(),
                  },
                },
              }
            : {}),
        },
        include: { history: true },
      });

      return res.status(200).json(mapSkill(updated));
    }

    if (req.method === 'DELETE') {
      await prisma.skill.delete({ where: { id } });
      return res.status(200).json({ success: true });
    }

    return sendMethodNotAllowed(res, ['PATCH', 'DELETE']);
  } catch (error) {
    return sendServerError(res, error);
  }
}
