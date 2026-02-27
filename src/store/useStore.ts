import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { LogEntry, Skill, Project, Milestone } from '../types';

interface AppState {
  logs: LogEntry[];
  skills: Skill[];
  projects: Project[];
  milestones: Milestone[];

  // Logs
  addLog: (log: Omit<LogEntry, 'id'>) => void;
  updateLog: (id: string, data: Partial<Omit<LogEntry, 'id'>>) => void;
  deleteLog: (id: string) => void;

  // Skills
  addSkill: (skill: Omit<Skill, 'id' | 'history'>) => void;
  updateSkillLevel: (id: string, level: number) => void;
  updateSkillName: (id: string, name: string) => void;
  deleteSkill: (id: string) => void;

  // Projects
  addProject: (project: Omit<Project, 'id'>) => void;
  updateProject: (id: string, data: Partial<Omit<Project, 'id'>>) => void;
  updateProjectStatus: (id: string, status: 'ongoing' | 'completed') => void;
  deleteProject: (id: string) => void;

  // Milestones
  addMilestone: (milestone: Omit<Milestone, 'id'>) => void;
  updateMilestone: (id: string, data: Partial<Omit<Milestone, 'id'>>) => void;
  deleteMilestone: (id: string) => void;
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      logs: [],
      skills: [],
      projects: [],
      milestones: [],

      // --- Logs ---
      addLog: (log) =>
        set((state) => ({
          logs: [...state.logs, { ...log, id: crypto.randomUUID() }],
        })),
      updateLog: (id, data) =>
        set((state) => ({
          logs: state.logs.map((l) => (l.id === id ? { ...l, ...data } : l)),
        })),
      deleteLog: (id) =>
        set((state) => ({
          logs: state.logs.filter((l) => l.id !== id),
        })),

      // --- Skills ---
      addSkill: (skill) =>
        set((state) => ({
          skills: [
            ...state.skills,
            {
              ...skill,
              id: crypto.randomUUID(),
              history: [{ date: new Date().toISOString(), level: skill.level }],
            },
          ],
        })),
      updateSkillLevel: (id, level) =>
        set((state) => ({
          skills: state.skills.map((s) =>
            s.id === id
              ? { ...s, level, history: [...s.history, { date: new Date().toISOString(), level }] }
              : s
          ),
        })),
      updateSkillName: (id, name) =>
        set((state) => ({
          skills: state.skills.map((s) => (s.id === id ? { ...s, name } : s)),
        })),
      deleteSkill: (id) =>
        set((state) => ({
          skills: state.skills.filter((s) => s.id !== id),
        })),

      // --- Projects ---
      addProject: (project) =>
        set((state) => ({
          projects: [...state.projects, { ...project, id: crypto.randomUUID() }],
        })),
      updateProject: (id, data) =>
        set((state) => ({
          projects: state.projects.map((p) => (p.id === id ? { ...p, ...data } : p)),
        })),
      updateProjectStatus: (id, status) =>
        set((state) => ({
          projects: state.projects.map((p) => (p.id === id ? { ...p, status } : p)),
        })),
      deleteProject: (id) =>
        set((state) => ({
          projects: state.projects.filter((p) => p.id !== id),
        })),

      // --- Milestones ---
      addMilestone: (milestone) =>
        set((state) => ({
          milestones: [...state.milestones, { ...milestone, id: crypto.randomUUID() }],
        })),
      updateMilestone: (id, data) =>
        set((state) => ({
          milestones: state.milestones.map((m) => (m.id === id ? { ...m, ...data } : m)),
        })),
      deleteMilestone: (id) =>
        set((state) => ({
          milestones: state.milestones.filter((m) => m.id !== id),
        })),
    }),
    {
      name: 'growth-tracker-storage',
      version: 1,
    }
  )
);
