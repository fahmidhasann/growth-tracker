export type LogEntry = {
  id: string;
  date: string;
  learned: string;
  built: string;
  challenges: string;
  mood: number; // 1-5
};

export type Skill = {
  id: string;
  name: string;
  level: number; // 1-5 (Beginner to Advanced)
  history: { date: string; level: number }[];
};

export type Project = {
  id: string;
  title: string;
  description: string;
  date: string;
  status: 'ongoing' | 'completed';
};

export type Milestone = {
  id: string;
  title: string;
  date: string;
  description?: string;
};
