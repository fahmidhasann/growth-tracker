/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { lazy, Suspense, useCallback, useEffect, useState } from 'react';
import { Layout } from './components/Layout';
import { useStore } from './store/useStore';
import { AuthScreen } from './components/AuthScreen';
import { StatusBanner } from './components/StatusBanner';
import { ToastContainer } from './components/Toast';

export type Tab = 'dashboard' | 'logs' | 'skills' | 'projects' | 'milestones';
export type Theme = 'dark' | 'light';
const VALID_TABS: Tab[] = ['dashboard', 'logs', 'skills', 'projects', 'milestones'];
const Dashboard = lazy(() => import('./pages/Dashboard').then((module) => ({ default: module.Dashboard })));
const Logs = lazy(() => import('./pages/Logs').then((module) => ({ default: module.Logs })));
const Skills = lazy(() => import('./pages/Skills').then((module) => ({ default: module.Skills })));
const Projects = lazy(() => import('./pages/Projects').then((module) => ({ default: module.Projects })));
const Milestones = lazy(() =>
  import('./pages/Milestones').then((module) => ({ default: module.Milestones }))
);

function getTabFromHash(): Tab {
  const hash = window.location.hash.replace('#', '') as Tab;
  return VALID_TABS.includes(hash) ? hash : 'dashboard';
}

function Spinner() {
  return (
    <div className="gt-app-shell flex min-h-screen items-center justify-center px-4">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <div className="h-12 w-12 rounded-full border-2 border-[var(--border-subtle)]" />
          <div className="absolute inset-0 h-12 w-12 animate-spin rounded-full border-2 border-transparent border-t-[var(--accent-strong)]" />
        </div>
        <p className="font-mono text-xs tracking-[0.2em] text-[var(--text-soft)]">LOADING</p>
      </div>
    </div>
  );
}

function DataLoadingSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="space-y-3">
        <div className="h-8 w-40 rounded-2xl bg-[var(--surface-soft)]" />
        <div className="h-4 w-72 rounded-xl bg-[var(--surface-soft)]" />
      </div>
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="gt-panel h-28 rounded-[1.5rem] bg-[var(--surface-soft)]" />
        ))}
      </div>
      <div className="gt-panel h-40 rounded-[1.75rem] bg-[var(--surface-soft)]" />
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <div className="gt-panel h-80 rounded-[1.75rem] bg-[var(--surface-soft)]" />
        <div className="gt-panel h-80 rounded-[1.75rem] bg-[var(--surface-soft)]" />
      </div>
    </div>
  );
}

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>(getTabFromHash);
  const [theme, setTheme] = useState<Theme>(() => {
    const savedTheme = window.localStorage.getItem('growth-tracker-theme');
    if (savedTheme === 'dark' || savedTheme === 'light') {
      return savedTheme;
    }
    return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  });
  const [authLoading, setAuthLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const initialize = useStore((s) => s.initialize);
  const loading = useStore((s) => s.loading);
  const initialized = useStore((s) => s.initialized);
  const error = useStore((s) => s.error);
  const clearError = useStore((s) => s.clearError);

  const navigate = useCallback((tab: Tab) => {
    window.location.hash = tab;
    setActiveTab(tab);
  }, []);

  const checkSession = useCallback(async () => {
    setAuthLoading(true);
    try {
      const response = await fetch('/api/auth?action=me');
      const payload = (await response.json()) as { user: { id: string; email: string } | null };
      setIsAuthenticated(Boolean(payload.user));
    } catch {
      setIsAuthenticated(false);
    } finally {
      setAuthLoading(false);
    }
  }, []);

  useEffect(() => {
    void checkSession();
  }, [checkSession]);

  useEffect(() => {
    if (isAuthenticated) {
      void initialize();
    }
  }, [initialize, isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) return;
    const onHashChange = () => setActiveTab(getTabFromHash());
    window.addEventListener('hashchange', onHashChange);
    // Set initial hash if missing
    if (!window.location.hash) window.location.hash = 'dashboard';
    return () => window.removeEventListener('hashchange', onHashChange);
  }, [isAuthenticated]);

  useEffect(() => {
    document.documentElement.classList.toggle('light', theme === 'light');
    window.localStorage.setItem('growth-tracker-theme', theme);

    const metaTheme = document.querySelector('meta[name="theme-color"]');
    metaTheme?.setAttribute('content', theme === 'light' ? '#f3f6fb' : '#0b1220');
  }, [theme]);

  const handleLogout = useCallback(async () => {
    try {
      await fetch('/api/auth?action=logout', { method: 'POST' });
    } catch {
      // Best effort; force a fresh unauthenticated load either way.
    } finally {
      window.location.assign(window.location.pathname);
    }
  }, []);

  if (authLoading) {
    return <Spinner />;
  }

  if (!isAuthenticated) {
    return <AuthScreen onAuthenticated={() => void checkSession()} />;
  }

  return (
    <Layout
      activeTab={activeTab}
      setActiveTab={navigate}
      theme={theme}
      setTheme={setTheme}
      onLogout={() => void handleLogout()}
    >
      {error ? <StatusBanner message={error} onDismiss={clearError} /> : null}
      {!initialized && loading && <DataLoadingSkeleton />}
      {!initialized && !loading && error && (
        <div className="gt-panel flex min-h-[50vh] flex-col items-center justify-center gap-4 rounded-[1.75rem] px-6 py-10 text-center">
          <p className="text-sm text-[var(--text-secondary)]">{error}</p>
          <button
            onClick={() => void initialize()}
            className="rounded-2xl bg-[var(--accent-strong)] px-4 py-2 text-sm font-medium text-white transition-colors hover:brightness-110 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--ring-focus)]"
          >
            Retry
          </button>
        </div>
      )}
      {initialized && (
        <Suspense fallback={<DataLoadingSkeleton />}>
          {activeTab === 'dashboard' && <Dashboard onNavigate={navigate} />}
          {activeTab === 'logs' && <Logs />}
          {activeTab === 'skills' && <Skills />}
          {activeTab === 'projects' && <Projects />}
          {activeTab === 'milestones' && <Milestones />}
        </Suspense>
      )}
      <ToastContainer />
    </Layout>
  );
}
