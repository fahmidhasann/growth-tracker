import type { ReactNode } from 'react';
import {
  BookOpen,
  FolderGit2,
  LogOut,
  Moon,
  PenTool,
  Sun,
  Trophy,
  LayoutDashboard,
} from 'lucide-react';
import { cn } from '../lib/utils';
import type { Tab, Theme } from '../App';

interface LayoutProps {
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
  theme: Theme;
  setTheme: (theme: Theme) => void;
  onLogout: () => void;
  children: ReactNode;
}

export function Layout({ activeTab, setActiveTab, theme, setTheme, onLogout, children }: LayoutProps) {
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
    <div className="gt-app-shell flex min-h-screen flex-col md:flex-row">
      <aside className="hidden w-[17.5rem] shrink-0 px-4 py-5 md:flex">
        <div className="gt-panel-strong sticky top-5 flex h-[calc(100vh-2.5rem)] w-full flex-col rounded-[2rem] p-4">
          <div className="mb-8 flex items-center gap-3 px-2">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-500/12 text-[var(--warning)]">
              <Trophy className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-base font-semibold tracking-tight text-[var(--text-primary)]">Growth Tracker</h1>
              <p className="mt-1 text-xs text-[var(--text-muted)]">Personal learning dashboard</p>
            </div>
          </div>

          <div className="mb-6 rounded-[1.5rem] border border-[var(--border-subtle)] bg-[var(--surface-soft)] px-4 py-3">
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-[var(--text-soft)]">Workspace</p>
            <p className="mt-2 text-sm leading-relaxed text-[var(--text-secondary)]">
              Track progress, update milestones, and keep your activity history organized in one place.
            </p>
          </div>

          <nav aria-label="Main navigation" className="flex-1 space-y-1">
            <p className="px-3 pb-2 text-xs font-medium uppercase tracking-[0.18em] text-[var(--text-soft)]">
              Navigate
            </p>
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
                    'flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-sm font-medium transition-all',
                    'focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--ring-focus)]',
                    isActive
                      ? 'bg-[var(--surface-elevated)] text-[var(--text-primary)] shadow-[0_12px_28px_rgba(15,23,42,0.12)]'
                      : 'text-[var(--text-muted)] hover:bg-[var(--surface-soft)] hover:text-[var(--text-primary)]'
                  )}
                >
                  <div
                    className={cn(
                      'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-colors',
                      isActive ? 'bg-[var(--surface-soft)] text-[var(--accent)]' : 'bg-transparent'
                    )}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  {item.label}
                </button>
              );
            })}
          </nav>

          <div className="mt-auto space-y-3 border-t gt-hairline px-2 pt-4">
            <button
              type="button"
              onClick={() => setTheme(nextTheme)}
              className="gt-panel flex w-full items-center justify-between rounded-2xl px-3 py-3 text-sm font-medium text-[var(--text-secondary)] transition-colors hover:bg-[var(--surface-elevated)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--ring-focus)]"
              aria-label={`Switch to ${nextTheme} mode`}
              title={`Switch to ${nextTheme} mode`}
            >
              <span className="flex items-center gap-3">
                <ThemeIcon className="h-4 w-4 text-[var(--accent)]" />
                Theme
              </span>
              <span className="text-xs uppercase tracking-[0.18em] text-[var(--text-soft)]">{nextTheme}</span>
            </button>
            <button
              type="button"
              onClick={onLogout}
              className="flex w-full items-center justify-between rounded-2xl px-3 py-3 text-sm font-medium text-[var(--text-muted)] transition-colors hover:bg-[var(--surface-soft)] hover:text-[var(--text-primary)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--ring-focus)]"
            >
              <span className="flex items-center gap-3">
                <LogOut className="h-4 w-4" />
                Sign out
              </span>
            </button>
            <p className="px-1 text-[11px] font-mono uppercase tracking-[0.18em] text-[var(--text-soft)]">
              Synced workspace
            </p>
          </div>
        </div>
      </aside>

      <div className="flex min-h-screen min-w-0 flex-1 flex-col">
        <header className="gt-safe-top sticky top-0 z-30 md:hidden">
          <div className="border-b gt-hairline bg-[var(--surface-base)]/92 backdrop-blur-xl">
            <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
              <div className="min-w-0">
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-[var(--text-soft)]">Growth Tracker</p>
                <p className="truncate text-sm font-semibold text-[var(--text-primary)]">Personal learning dashboard</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setTheme(nextTheme)}
                  className="gt-panel flex h-11 w-11 items-center justify-center rounded-2xl text-[var(--text-secondary)] transition-colors hover:bg-[var(--surface-elevated)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--ring-focus)]"
                  aria-label={`Switch to ${nextTheme} mode`}
                >
                  <ThemeIcon className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={onLogout}
                  className="gt-panel flex h-11 w-11 items-center justify-center rounded-2xl text-[var(--text-secondary)] transition-colors hover:bg-[var(--surface-elevated)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--ring-focus)]"
                  aria-label="Sign out"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 pb-28 pt-4 sm:px-6 md:px-8 md:pb-10 md:pt-8 lg:px-10">
            {children}
          </div>
        </main>
      </div>

      <nav aria-label="Mobile navigation" className="gt-safe-bottom fixed inset-x-0 bottom-0 z-40 md:hidden">
        <div className="mx-auto max-w-md px-3 pb-3">
          <div className="gt-panel-strong grid grid-cols-5 gap-1 rounded-[1.75rem] p-2">
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
                    'flex min-h-16 flex-col items-center justify-center gap-1 rounded-2xl px-1.5 text-[11px] font-medium transition-colors',
                    'focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--ring-focus)]',
                    isActive
                      ? 'bg-[var(--surface-elevated)] text-[var(--text-primary)]'
                      : 'text-[var(--text-muted)] hover:bg-[var(--surface-soft)] hover:text-[var(--text-primary)]'
                  )}
                >
                  <div className="relative">
                    <Icon className="h-4.5 w-4.5" />
                    {isActive && (
                      <span className="absolute -top-1 left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-[var(--accent)]" />
                    )}
                  </div>
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>
    </div>
  );
}
