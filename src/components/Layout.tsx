import type { ReactNode } from 'react';
import { LayoutDashboard, BookOpen, PenTool, FolderGit2, Trophy, Sun, Moon } from 'lucide-react';
import { cn } from '../lib/utils';
import type { Tab, Theme } from '../App';

interface LayoutProps {
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
  theme: Theme;
  setTheme: (theme: Theme) => void;
  children: ReactNode;
}

export function Layout({ activeTab, setActiveTab, theme, setTheme, children }: LayoutProps) {
  const navItems = [
    { id: 'dashboard' as Tab, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'logs' as Tab, label: 'Logs', icon: BookOpen },
    { id: 'skills' as Tab, label: 'Skills', icon: PenTool },
    { id: 'projects' as Tab, label: 'Projects', icon: FolderGit2 },
    { id: 'milestones' as Tab, label: 'Milestones', icon: Trophy },
  ];

  const nextTheme = theme === 'dark' ? 'light' : 'dark';
  const ThemeIcon = theme === 'dark' ? Sun : Moon;

  return (
    <div className="h-screen bg-zinc-950 text-zinc-50 flex flex-col md:flex-row font-sans overflow-hidden">
      {/* Sidebar for Desktop */}
      <aside className="hidden md:flex flex-col w-64 border-r border-zinc-800/70 bg-gradient-to-b from-zinc-950 to-zinc-950/95 p-4">
        <div className="mb-8 px-4 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber-500/15 border border-amber-500/20 flex items-center justify-center shrink-0">
            <Trophy className="w-4 h-4 text-amber-400" />
          </div>
          <div>
            <h1 className="text-base font-semibold tracking-tight text-zinc-100 leading-none">Growth Tracker</h1>
            <p className="text-[10px] text-zinc-500 mt-0.5">Track your learning journey</p>
          </div>
        </div>
        <nav aria-label="Main navigation" className="flex-1 space-y-0.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                aria-current={isActive ? 'page' : undefined}
                aria-label={item.label}
                className={cn(
                  "w-full flex items-center gap-3 py-2.5 rounded-xl text-sm font-medium transition-all",
                  "focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40",
                  isActive
                    ? "bg-zinc-800/80 text-zinc-100 border-l-2 border-blue-500 pl-[calc(1rem-2px)] pr-4"
                    : "pl-4 pr-4 text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200"
                )}
              >
                <Icon className={cn("w-4 h-4 shrink-0", isActive && "text-blue-400")} />
                {item.label}
              </button>
            );
          })}
        </nav>
        <div className="mt-auto px-2 pt-4 border-t border-zinc-800/50">
          <button
            type="button"
            onClick={() => setTheme(nextTheme)}
            className="mb-3 w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-zinc-900/70 border border-zinc-800 text-zinc-300 hover:bg-zinc-800/80 hover:text-zinc-100 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40"
            aria-label={`Switch to ${nextTheme} mode`}
            title={`Switch to ${nextTheme} mode`}
          >
            <ThemeIcon className="w-4 h-4" />
            <span className="text-xs font-medium capitalize">{nextTheme} mode</span>
          </button>
          <p className="text-[10px] text-zinc-700 font-mono text-center">v1.1 · cloud sync</p>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pb-20 md:pb-0">
        <div className="max-w-5xl mx-auto p-4 md:p-8">
          {children}
        </div>
      </main>

      {/* Bottom Nav for Mobile */}
      <nav aria-label="Mobile navigation" className="md:hidden fixed bottom-0 left-0 right-0 bg-zinc-950/80 backdrop-blur-lg border-t border-zinc-800 flex justify-around p-2 z-50">
        <button
          type="button"
          onClick={() => setTheme(nextTheme)}
          aria-label={`Switch to ${nextTheme} mode`}
          className="flex flex-col items-center gap-1 p-2 rounded-lg transition-colors text-zinc-500 hover:text-zinc-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40"
        >
          <div className="relative">
            <ThemeIcon className="w-5 h-5" />
          </div>
          <span className="text-[10px] font-medium capitalize">Theme</span>
        </button>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              aria-current={isActive ? 'page' : undefined}
              aria-label={item.label}
              className={cn(
                "flex flex-col items-center gap-1 p-2 rounded-lg transition-colors",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40",
                isActive
                  ? "text-zinc-100"
                  : "text-zinc-500 hover:text-zinc-300"
              )}
            >
              <div className="relative">
                <Icon className="w-5 h-5" />
                {isActive && (
                  <span className="absolute -top-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-blue-400" />
                )}
              </div>
              <span className="text-[10px] font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
