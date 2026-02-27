import type { VercelRequest, VercelResponse } from '@vercel/node';
import { requireAuth } from '../_lib/auth.js';
import { prisma } from '../_lib/db.js';
import { isValidDate, parseJsonBody, sendMethodNotAllowed, sendServerError } from '../_lib/http.js';
import { mapProject } from '../_lib/mappers.js';

type CreateProjectBody = {
  id?: string;
  title: string;
  description: string;
  date: string;
  status: 'ongoing' | 'completed';
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const user = await requireAuth(req, res);
    if (!user) return;

    if (req.method === 'GET') {
      const projects = await prisma.project.findMany({
        orderBy: { date: 'desc' },
      });
      return res.status(200).json(projects.map(mapProject));
    }

    if (req.method === 'POST') {
      const body = parseJsonBody<CreateProjectBody>(req);

      if (!body.title?.trim() || !body.description?.trim()) {
        return res.status(400).json({ error: 'title and description are required' });
      }
      if (!body.date || !isValidDate(body.date)) {
        return res.status(400).json({ error: 'Valid date is required' });
      }
      if (body.status !== 'ongoing' && body.status !== 'completed') {
        return res.status(400).json({ error: 'status must be ongoing or completed' });
      }

      const created = await prisma.project.create({
        data: {
          ...(body.id ? { id: body.id } : {}),
          title: body.title.trim(),
          description: body.description.trim(),
          date: new Date(body.date),
          status: body.status,
        },
      });

      return res.status(201).json(mapProject(created));
    }

    return sendMethodNotAllowed(res, ['GET', 'POST']);
  } catch (error) {
    return sendServerError(res, error);
  }
}
