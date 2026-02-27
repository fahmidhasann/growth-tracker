import type {
  LogEntry as PrismaLogEntry,
  Milestone as PrismaMilestone,
  Project as PrismaProject,
  Skill as PrismaSkill,
  SkillHistory,
} from '@prisma/client';

export function mapLog(log: PrismaLogEntry) {
  return {
    id: log.id,
    date: log.date.toISOString(),
    learned: log.learned,
    built: log.built,
    challenges: log.challenges,
    mood: log.mood,
  };
}

export function mapSkill(skill: PrismaSkill & { history: SkillHistory[] }) {
  return {
    id: skill.id,
    name: skill.name,
    level: skill.level,
    history: skill.history
      .sort((a, b) => a.date.getTime() - b.date.getTime())
      .map((entry) => ({
        date: entry.date.toISOString(),
        level: entry.level,
      })),
  };
}

export function mapProject(project: PrismaProject) {
  return {
    id: project.id,
    title: project.title,
    description: project.description,
    date: project.date.toISOString(),
    status: project.status as 'ongoing' | 'completed',
  };
}

export function mapMilestone(milestone: PrismaMilestone) {
  return {
    id: milestone.id,
    title: milestone.title,
    description: milestone.description ?? undefined,
    date: milestone.date.toISOString(),
  };
}
