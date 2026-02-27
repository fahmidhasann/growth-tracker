import { describe, it, expect } from 'vitest';
import { mapLog, mapSkill, mapProject, mapMilestone } from './mappers';

const baseDate = new Date('2024-03-15T12:00:00Z');

describe('mapLog', () => {
  it('maps a Prisma LogEntry to the API shape', () => {
    const prismaLog = {
      id: 'log-1',
      date: baseDate,
      learned: 'TypeScript generics',
      built: 'A React component',
      challenges: 'Understanding variance',
      mood: 4,
      createdAt: baseDate,
      updatedAt: baseDate,
    } as any;

    expect(mapLog(prismaLog)).toEqual({
      id: 'log-1',
      date: baseDate.toISOString(),
      learned: 'TypeScript generics',
      built: 'A React component',
      challenges: 'Understanding variance',
      mood: 4,
    });
  });
});

describe('mapSkill', () => {
  it('maps a Prisma Skill with history to the API shape (sorted by date)', () => {
    const earlyDate = new Date('2024-01-01T00:00:00Z');
    const lateDate = new Date('2024-06-01T00:00:00Z');
    const prismaSkill = {
      id: 'skill-1',
      name: 'Python',
      level: 3,
      createdAt: earlyDate,
      updatedAt: lateDate,
      history: [
        { id: 'h2', skillId: 'skill-1', level: 3, date: lateDate, createdAt: lateDate },
        { id: 'h1', skillId: 'skill-1', level: 1, date: earlyDate, createdAt: earlyDate },
      ],
    } as any;

    const result = mapSkill(prismaSkill);
    expect(result).toEqual({
      id: 'skill-1',
      name: 'Python',
      level: 3,
      history: [
        { date: earlyDate.toISOString(), level: 1 },
        { date: lateDate.toISOString(), level: 3 },
      ],
    });
  });

  it('returns an empty history array when skill has no history', () => {
    const prismaSkill = {
      id: 'skill-2',
      name: 'Rust',
      level: 2,
      createdAt: baseDate,
      updatedAt: baseDate,
      history: [],
    } as any;

    expect(mapSkill(prismaSkill).history).toEqual([]);
  });
});

describe('mapProject', () => {
  it('maps a Prisma Project to the API shape', () => {
    const prismaProject = {
      id: 'proj-1',
      title: 'Growth Tracker',
      description: 'A personal growth app',
      date: baseDate,
      status: 'ongoing',
      createdAt: baseDate,
      updatedAt: baseDate,
    } as any;

    expect(mapProject(prismaProject)).toEqual({
      id: 'proj-1',
      title: 'Growth Tracker',
      description: 'A personal growth app',
      date: baseDate.toISOString(),
      status: 'ongoing',
    });
  });
});

describe('mapMilestone', () => {
  it('maps a Prisma Milestone with a description to the API shape', () => {
    const prismaMilestone = {
      id: 'ms-1',
      title: 'First Commit',
      description: 'Started the project',
      date: baseDate,
      createdAt: baseDate,
      updatedAt: baseDate,
    } as any;

    expect(mapMilestone(prismaMilestone)).toEqual({
      id: 'ms-1',
      title: 'First Commit',
      description: 'Started the project',
      date: baseDate.toISOString(),
    });
  });

  it('omits description when it is null', () => {
    const prismaMilestone = {
      id: 'ms-2',
      title: 'Another milestone',
      description: null,
      date: baseDate,
      createdAt: baseDate,
      updatedAt: baseDate,
    } as any;

    const result = mapMilestone(prismaMilestone);
    expect(result.description).toBeUndefined();
  });
});
