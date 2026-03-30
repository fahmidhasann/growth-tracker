import { lazy, Suspense, useMemo } from 'react';
import { useStore } from '../store/useStore';
import { StatCard } from '../components/StatCard';
import { Activity, FolderGit2, PenTool, Trophy } from 'lucide-react';
import { format, subDays } from 'date-fns';
import { motion } from 'motion/react';
import type { Tab } from '../App';

interface DashboardProps {
  onNavigate: (tab: Tab) => void;
}

const Heatmap = lazy(() => import('../components/Heatmap').then((module) => ({ default: module.Heatmap })));
const SkillLevelsChart = lazy(() =>
  import('../components/dashboard/SkillLevelsChart').then((module) => ({ default: module.SkillLevelsChart }))
);
const MoodTrendChart = lazy(() =>
  import('../components/dashboard/MoodTrendChart').then((module) => ({ default: module.MoodTrendChart }))
);

function ChartSkeleton() {
  return <div className="h-full animate-pulse rounded-[1.25rem] bg-[var(--surface-soft)]" />;
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
      className="space-y-6 sm:space-y-8"
    >
      <section className="gt-panel-strong rounded-[2rem] p-6 sm:p-7">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-3">
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-[var(--text-soft)]">Overview</p>
            <div>
              <h2 className="text-3xl font-semibold tracking-tight text-[var(--text-primary)] sm:text-[2.3rem]">
                Dashboard
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[var(--text-muted)] sm:text-base">
                A clear view of your learning activity, current skills, and recent momentum across the tracker.
              </p>
            </div>
          </div>
          <div
            className={`inline-flex items-center gap-3 self-start rounded-[1.25rem] border px-4 py-3 text-sm ${
              currentStreak > 0
                ? 'border-amber-500/20 bg-amber-500/10 text-[var(--warning)]'
                : 'border-[var(--border-subtle)] bg-[var(--surface-soft)] text-[var(--text-secondary)]'
            }`}
          >
            <span className="text-base leading-none">{currentStreak > 0 ? '🔥' : '✨'}</span>
            <div>
              <p className="font-semibold">
                {currentStreak > 0 ? `${currentStreak}-day streak` : 'Start your streak today'}
              </p>
              <p className="mt-1 text-xs text-[var(--text-muted)]">
                {currentStreak > 0 ? 'You have recorded activity on consecutive days.' : 'Add a log, skill, project, or milestone to begin.'}
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <StatCard icon={FolderGit2} color="emerald" count={projects.length} label="Projects" index={0} />
        <StatCard icon={PenTool} color="blue" count={skills.length} label="Skills" index={1} />
        <StatCard icon={Trophy} color="amber" count={milestones.length} label="Milestones" index={2} />
        <StatCard icon={Activity} color="purple" count={logs.length} label="Entries" index={3} />
      </div>

      <Suspense fallback={<div className="gt-panel h-72 animate-pulse rounded-[1.75rem] bg-[var(--surface-soft)]" />}>
        <Heatmap />
      </Suspense>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <div className="gt-panel rounded-[1.75rem] p-5 sm:p-6">
          <div className="mb-6 flex items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold text-[var(--text-primary)]">Skill levels</h3>
              <p className="mt-1 text-sm text-[var(--text-muted)]">Track your current proficiency at a glance.</p>
            </div>
          </div>
          <div className="h-64">
            {skillData.length > 0 ? (
              <Suspense fallback={<ChartSkeleton />}>
                <SkillLevelsChart data={skillData} />
              </Suspense>
            ) : (
              <div className="flex h-full flex-col items-center justify-center gap-3">
                <p className="text-sm text-[var(--text-muted)]">No skills added yet.</p>
                <button
                  onClick={() => onNavigate('skills')}
                  className="text-sm font-medium text-[var(--accent-strong)] transition-colors hover:opacity-80"
                >
                  Add your first skill &rarr;
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="gt-panel rounded-[1.75rem] p-5 sm:p-6">
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-[var(--text-primary)]">Recent mood trend</h3>
            <p className="mt-1 text-sm text-[var(--text-muted)]">A quick read on the last ten learning entries.</p>
          </div>
          <div className="h-64">
            {moodData.length > 0 ? (
              <Suspense fallback={<ChartSkeleton />}>
                <MoodTrendChart data={moodData} />
              </Suspense>
            ) : (
              <div className="flex h-full flex-col items-center justify-center gap-3">
                <p className="text-sm text-[var(--text-muted)]">No logs added yet.</p>
                <button
                  onClick={() => onNavigate('logs')}
                  className="text-sm font-medium text-[var(--accent-strong)] transition-colors hover:opacity-80"
                >
                  Create your first log &rarr;
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <section className="gt-panel rounded-[1.75rem] p-5 sm:p-6">
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-[var(--text-primary)]">Journey timeline</h3>
          <p className="mt-1 text-sm text-[var(--text-muted)]">Recent milestones in reverse chronological order.</p>
        </div>
        <div className="space-y-5">
          {sortedMilestones.length > 0 ? (
            sortedMilestones.map((milestone) => (
              <div
                key={milestone.id}
                className="relative rounded-[1.5rem] border border-[var(--border-subtle)] bg-[var(--surface-soft)] p-4 sm:pl-16"
              >
                <div className="absolute left-4 top-4 hidden h-9 w-9 items-center justify-center rounded-2xl bg-amber-500/12 text-[var(--warning)] sm:flex">
                  <div className="h-2.5 w-2.5 rounded-full bg-[var(--warning)]" />
                </div>
                <div>
                  <p className="mb-1 text-xs font-mono text-[var(--text-soft)]">
                    {format(new Date(milestone.date), 'MMM dd, yyyy')}
                  </p>
                  <h4 className="text-lg font-medium text-[var(--text-primary)]">{milestone.title}</h4>
                  {milestone.description && (
                    <p className="mt-2 text-sm leading-relaxed text-[var(--text-muted)]">{milestone.description}</p>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center gap-3 py-8">
              <p className="text-sm text-[var(--text-muted)]">No milestones recorded yet.</p>
              <button
                onClick={() => onNavigate('milestones')}
                className="text-sm font-medium text-[var(--accent-strong)] transition-colors hover:opacity-80"
              >
                Add a milestone &rarr;
              </button>
            </div>
          )}
        </div>
      </section>
    </motion.div>
  );
}
