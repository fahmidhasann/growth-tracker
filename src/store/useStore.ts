import { create } from 'zustand';
import { LogEntry, Skill, Project, Milestone } from '../types';
import { toast } from '../components/Toast';

interface AppState {
  initialized: boolean;
  loading: boolean;
  error: string | null;
  mutating: boolean;
  clearError: () => void;
  logs: LogEntry[];
  skills: Skill[];
  projects: Project[];
  milestones: Milestone[];
  initialize: () => Promise<void>;

  // Logs
  addLog: (log: Omit<LogEntry, 'id'>) => Promise<void>;
  updateLog: (id: string, data: Partial<Omit<LogEntry, 'id'>>) => Promise<void>;
  deleteLog: (id: string) => Promise<void>;

  // Skills
  addSkill: (skill: Omit<Skill, 'id' | 'history'>) => Promise<void>;
  updateSkillLevel: (id: string, level: number) => Promise<void>;
  updateSkillName: (id: string, name: string) => Promise<void>;
  deleteSkill: (id: string) => Promise<void>;

  // Projects
  addProject: (project: Omit<Project, 'id'>) => Promise<void>;
  updateProject: (id: string, data: Partial<Omit<Project, 'id'>>) => Promise<void>;
  updateProjectStatus: (id: string, status: 'ongoing' | 'completed') => Promise<void>;
  deleteProject: (id: string) => Promise<void>;

  // Milestones
  addMilestone: (milestone: Omit<Milestone, 'id'>) => Promise<void>;
  updateMilestone: (id: string, data: Partial<Omit<Milestone, 'id'>>) => Promise<void>;
  deleteMilestone: (id: string) => Promise<void>;
}

async function apiRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
    ...init,
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    throw new Error(payload.error ?? `Request failed with status ${response.status}`);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

export const useStore = create<AppState>()((set, get) => ({
  initialized: false,
  loading: false,
  mutating: false,
  error: null,
  clearError: () => set({ error: null }),
  logs: [],
  skills: [],
  projects: [],
  milestones: [],
  initialize: async () => {
    if (get().initialized || get().loading) return;
    set({ loading: true, error: null });
    try {
      const [logs, skills, projects, milestones] = await Promise.all([
        apiRequest<LogEntry[]>('/api/logs'),
        apiRequest<Skill[]>('/api/skills'),
        apiRequest<Project[]>('/api/projects'),
        apiRequest<Milestone[]>('/api/milestones'),
      ]);

      set({
        logs,
        skills,
        projects,
        milestones,
        initialized: true,
        loading: false,
        error: null,
      });
    } catch (error) {
      set({
        loading: false,
        error: error instanceof Error ? error.message : 'Unable to load data',
      });
      console.error(error);
    }
  },

  // Logs
  addLog: async (log) => {
    set({ mutating: true });
    try {
      const created = await apiRequest<LogEntry>('/api/logs', {
        method: 'POST',
        body: JSON.stringify(log),
      });
      set((state) => ({ logs: [created, ...state.logs], error: null, mutating: false }));
      toast.success('Log entry added');
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Unable to add log', mutating: false });
      toast.error('Failed to add log');
      console.error(error);
    }
  },
  updateLog: async (id, data) => {
    set({ mutating: true });
    try {
      const updated = await apiRequest<LogEntry>(`/api/logs/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      });
      set((state) => ({
        logs: state.logs.map((entry) => (entry.id === id ? updated : entry)),
        error: null,
        mutating: false,
      }));
      toast.success('Log entry updated');
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Unable to update log', mutating: false });
      toast.error('Failed to update log');
      console.error(error);
    }
  },
  deleteLog: async (id) => {
    set({ mutating: true });
    try {
      await apiRequest<{ success: boolean }>(`/api/logs/${id}`, {
        method: 'DELETE',
      });
      set((state) => ({ logs: state.logs.filter((entry) => entry.id !== id), error: null, mutating: false }));
      toast.success('Log entry deleted');
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Unable to delete log', mutating: false });
      toast.error('Failed to delete log');
      console.error(error);
    }
  },

  // Skills
  addSkill: async (skill) => {
    set({ mutating: true });
    try {
      const created = await apiRequest<Skill>('/api/skills', {
        method: 'POST',
        body: JSON.stringify(skill),
      });
      set((state) => ({ skills: [created, ...state.skills], error: null, mutating: false }));
      toast.success('Skill added');
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Unable to add skill', mutating: false });
      toast.error('Failed to add skill');
      console.error(error);
    }
  },
  updateSkillLevel: async (id, level) => {
    set({ mutating: true });
    try {
      const updated = await apiRequest<Skill>(`/api/skills/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ level }),
      });
      set((state) => ({
        skills: state.skills.map((entry) => (entry.id === id ? updated : entry)),
        error: null,
        mutating: false,
      }));
      toast.success('Skill level updated');
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Unable to update skill level', mutating: false });
      toast.error('Failed to update skill');
      console.error(error);
    }
  },
  updateSkillName: async (id, name) => {
    set({ mutating: true });
    try {
      const updated = await apiRequest<Skill>(`/api/skills/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ name }),
      });
      set((state) => ({
        skills: state.skills.map((entry) => (entry.id === id ? updated : entry)),
        error: null,
        mutating: false,
      }));
      toast.success('Skill name updated');
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Unable to update skill', mutating: false });
      toast.error('Failed to update skill');
      console.error(error);
    }
  },
  deleteSkill: async (id) => {
    set({ mutating: true });
    try {
      await apiRequest<{ success: boolean }>(`/api/skills/${id}`, {
        method: 'DELETE',
      });
      set((state) => ({ skills: state.skills.filter((entry) => entry.id !== id), error: null, mutating: false }));
      toast.success('Skill deleted');
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Unable to delete skill', mutating: false });
      toast.error('Failed to delete skill');
      console.error(error);
    }
  },

  // Projects
  addProject: async (project) => {
    set({ mutating: true });
    try {
      const created = await apiRequest<Project>('/api/projects', {
        method: 'POST',
        body: JSON.stringify(project),
      });
      set((state) => ({ projects: [created, ...state.projects], error: null, mutating: false }));
      toast.success('Project added');
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Unable to add project', mutating: false });
      toast.error('Failed to add project');
      console.error(error);
    }
  },
  updateProject: async (id, data) => {
    set({ mutating: true });
    try {
      const updated = await apiRequest<Project>(`/api/projects/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      });
      set((state) => ({
        projects: state.projects.map((entry) => (entry.id === id ? updated : entry)),
        error: null,
        mutating: false,
      }));
      toast.success('Project updated');
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Unable to update project', mutating: false });
      toast.error('Failed to update project');
      console.error(error);
    }
  },
  updateProjectStatus: async (id, status) => {
    set({ mutating: true });
    try {
      const updated = await apiRequest<Project>(`/api/projects/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
      set((state) => ({
        projects: state.projects.map((entry) => (entry.id === id ? updated : entry)),
        error: null,
        mutating: false,
      }));
      toast.success('Project status updated');
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Unable to update project status', mutating: false });
      toast.error('Failed to update project');
      console.error(error);
    }
  },
  deleteProject: async (id) => {
    set({ mutating: true });
    try {
      await apiRequest<{ success: boolean }>(`/api/projects/${id}`, {
        method: 'DELETE',
      });
      set((state) => ({ projects: state.projects.filter((entry) => entry.id !== id), error: null, mutating: false }));
      toast.success('Project deleted');
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Unable to delete project', mutating: false });
      toast.error('Failed to delete project');
      console.error(error);
    }
  },

  // Milestones
  addMilestone: async (milestone) => {
    set({ mutating: true });
    try {
      const created = await apiRequest<Milestone>('/api/milestones', {
        method: 'POST',
        body: JSON.stringify(milestone),
      });
      set((state) => ({ milestones: [created, ...state.milestones], error: null, mutating: false }));
      toast.success('Milestone added');
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Unable to add milestone', mutating: false });
      toast.error('Failed to add milestone');
      console.error(error);
    }
  },
  updateMilestone: async (id, data) => {
    set({ mutating: true });
    try {
      const updated = await apiRequest<Milestone>(`/api/milestones/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      });
      set((state) => ({
        milestones: state.milestones.map((entry) => (entry.id === id ? updated : entry)),
        error: null,
        mutating: false,
      }));
      toast.success('Milestone updated');
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Unable to update milestone', mutating: false });
      toast.error('Failed to update milestone');
      console.error(error);
    }
  },
  deleteMilestone: async (id) => {
    set({ mutating: true });
    try {
      await apiRequest<{ success: boolean }>(`/api/milestones/${id}`, {
        method: 'DELETE',
      });
      set((state) => ({ milestones: state.milestones.filter((entry) => entry.id !== id), error: null, mutating: false }));
      toast.success('Milestone deleted');
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Unable to delete milestone', mutating: false });
      toast.error('Failed to delete milestone');
      console.error(error);
    }
  },
}));
