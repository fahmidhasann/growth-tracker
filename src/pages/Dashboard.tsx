import { useMemo } from 'react';
import { useStore } from '../store/useStore';
import { Heatmap } from '../components/Heatmap';
import { StatCard } from '../components/StatCard';
import { FolderGit2, PenTool, Trophy, Activity } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { format, subDays } from 'date-fns';
import { motion } from 'motion/react';
import { CHART_TOOLTIP_STYLE, CHART_AXIS_PROPS } from '../lib/constants';
import type { Tab } from '../App';

interface DashboardProps {
  onNavigate: (tab: Tab) => void;
}

export function Dashboard({ onNavigate }: DashboardProps) {
  const logs = useStore((s) => s.logs);
  const skills = useStore((s) => s.skills);
  const projects = useStore((s) => s.projects);
  const milestones = useStore((s) => s.milestones);

  const skillData = useMemo(
    () => skills.map((s) => ({ name: s.name, level: s.level })),
    [skills]
  );

  const moodData = useMemo(
    () =>
      logs.slice(-10).map((l) => ({
        date: format(new Date(l.date), 'MMM dd'),
        mood: l.mood,
      })),
    [logs]
  );

  const sortedMilestones = useMemo(
    () => [...milestones].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    [milestones]
  );

  // Build activity map (same sources as Heatmap)
  const activityMap = useMemo(() => {
    const acc: Record<string, number> = {};
    const toKey = (d: string) => d.slice(0, 10);
    const inc = (d: string) => { if (d) acc[toKey(d)] = (acc[toKey(d)] || 0) + 1; };
    logs.forEach((l) => inc(l.date));
    projects.forEach((p) => inc(p.date));
    milestones.forEach((m) => inc(m.date));
    skills.forEach((s) => s.history.forEach((h) => inc(h.date)));
    return acc;
  }, [logs, projects, milestones, skills]);

  // Calculate current streak (consecutive days with activity, counting back from today)
  const currentStreak = useMemo(() => {
    let streak = 0;
    let cursor = new Date();
    cursor.setHours(0, 0, 0, 0);
    // If today has no activity, start check from yesterday
    const todayKey = format(cursor, 'yyyy-MM-dd');
    if (!activityMap[todayKey]) {
      cursor = subDays(cursor, 1);
    }
    for (let i = 0; i < 365; i++) {
      const key = format(cursor, 'yyyy-MM-dd');
      if (activityMap[key]) {
        streak++;
        cursor = subDays(cursor, 1);
      } else {
        break;
      }
    }
    return streak;
  }, [activityMap]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="space-y-8"
    >
      <header className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 border-b border-zinc-800/50 [.light_&]:border-zinc-200/50 pb-6">
        <div>
          <h2 className="text-3xl font-semibold tracking-tight text-zinc-100">Dashboard</h2>
          <p className="text-zinc-400 mt-2">Your learning journey at a glance.</p>
        </div>
        {currentStreak > 0 ? (
          <div className="flex items-center gap-2 px-4 py-2 bg-amber-500/10 border border-amber-500/20 rounded-full self-start shrink-0">
            <span className="text-base leading-none">🔥</span>
            <span className="text-sm font-semibold text-amber-400">{currentStreak}-day streak</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 px-4 py-2 bg-zinc-800/50 border border-zinc-700/50 rounded-full self-start shrink-0">
            <span className="text-base leading-none">✨</span>
            <span className="text-sm font-medium text-zinc-400">Start your streak today</span>
          </div>
        )}
      </header>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={FolderGit2} color="emerald" count={projects.length} label="Projects" index={0} />
        <StatCard icon={PenTool} color="blue" count={skills.length} label="Skills" index={1} />
        <StatCard icon={Trophy} color="amber" count={milestones.length} label="Milestones" index={2} />
        <StatCard icon={Activity} color="purple" count={logs.length} label="Entries" index={3} />
      </div>

      {/* Heatmap */}
      <Heatmap />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Skills Chart */}
        <div className="p-6 bg-zinc-900/50 border border-zinc-800/50 rounded-2xl">
          <h3 className="text-sm font-semibold text-zinc-300 mb-6 border-l-2 border-blue-500 pl-3">Skill Levels</h3>
          <div className="h-64">
            {skillData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={skillData}>
                  <XAxis dataKey="name" {...CHART_AXIS_PROPS} />
                  <YAxis {...CHART_AXIS_PROPS} domain={[0, 5]} ticks={[1, 2, 3, 4, 5]} />
                  <Tooltip cursor={{ fill: '#27272a' }} contentStyle={CHART_TOOLTIP_STYLE} />
                  <Bar dataKey="level" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center gap-3">
                <p className="text-zinc-500 text-sm">No skills added yet.</p>
                <button
                  onClick={() => onNavigate('skills')}
                  className="text-blue-400 hover:text-blue-300 [.light_&]:text-blue-700 [.light_&]:hover:text-blue-800 text-sm font-medium transition-colors"
                >
                  Add your first skill &rarr;
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Mood Trend */}
        <div className="p-6 bg-zinc-900/50 border border-zinc-800/50 rounded-2xl">
          <h3 className="text-sm font-semibold text-zinc-300 mb-6 border-l-2 border-purple-500 pl-3">Recent Mood Trend</h3>
          <div className="h-64">
            {moodData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={moodData}>
                  <XAxis dataKey="date" {...CHART_AXIS_PROPS} />
                  <YAxis {...CHART_AXIS_PROPS} domain={[1, 5]} ticks={[1, 2, 3, 4, 5]} />
                  <Tooltip contentStyle={CHART_TOOLTIP_STYLE} />
                  <Line type="monotone" dataKey="mood" stroke="#a855f7" strokeWidth={2} dot={{ fill: '#a855f7', strokeWidth: 2 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center gap-3">
                <p className="text-zinc-500 text-sm">No logs added yet.</p>
                <button
                  onClick={() => onNavigate('logs')}
                  className="text-purple-400 hover:text-purple-300 [.light_&]:text-purple-700 [.light_&]:hover:text-purple-800 text-sm font-medium transition-colors"
                >
                  Create your first log &rarr;
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="p-6 bg-zinc-900/50 border border-zinc-800/50 rounded-2xl">
        <h3 className="text-sm font-semibold text-zinc-300 mb-6 border-l-2 border-amber-500 pl-3">Journey Timeline</h3>
        <div className="space-y-8">
          {sortedMilestones.length > 0 ? (
            sortedMilestones.map((milestone) => (
              <div key={milestone.id} className="relative pl-8 before:absolute before:left-3 before:top-2 before:bottom-[-2rem] last:before:bottom-0 before:w-px before:bg-zinc-800">
                <div className="absolute left-0 top-1.5 w-6 h-6 rounded-full bg-zinc-900 border-2 border-amber-500 flex items-center justify-center z-10 shadow-[0_0_10px_rgba(245,158,11,0.25)]">
                  <div className="w-2 h-2 rounded-full bg-amber-500" />
                </div>
                <div>
                  <p className="text-xs text-zinc-500 font-mono mb-1">{format(new Date(milestone.date), 'MMM dd, yyyy')}</p>
                  <h4 className="text-lg font-medium text-zinc-200">{milestone.title}</h4>
                  {milestone.description && (
                    <p className="text-zinc-400 mt-2 text-sm leading-relaxed">{milestone.description}</p>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-8 gap-3">
              <p className="text-zinc-500 text-sm">No milestones recorded yet.</p>
              <button
                onClick={() => onNavigate('milestones')}
                className="text-amber-400 hover:text-amber-300 [.light_&]:text-amber-700 [.light_&]:hover:text-amber-800 text-sm font-medium transition-colors"
              >
                Add a milestone &rarr;
              </button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
