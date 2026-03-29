/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback } from 'react';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { Logs } from './pages/Logs';
import { Skills } from './pages/Skills';
import { Projects } from './pages/Projects';
import { Milestones } from './pages/Milestones';
import { useStore } from './store/useStore';
import { AuthScreen } from './components/AuthScreen';

export type Tab = 'dashboard' | 'logs' | 'skills' | 'projects' | 'milestones';
export type Theme = 'dark' | 'light';
const VALID_TABS: Tab[] = ['dashboard', 'logs', 'skills', 'projects', 'milestones'];

function getTabFromHash(): Tab {
  const hash = window.location.hash.replace('#', '') as Tab;
  return VALID_TABS.includes(hash) ? hash : 'dashboard';
}

function Spinner() {
  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <div className="w-10 h-10 rounded-full border-2 border-zinc-800" />
          <div className="absolute inset-0 w-10 h-10 rounded-full border-2 border-transparent border-t-zinc-400 animate-spin" />
        </div>
        <p className="text-zinc-600 text-xs font-mono tracking-wider">Loading...</p>
      </div>
    </div>
  );
}

function DataLoadingSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="space-y-2">
        <div className="h-8 w-40 bg-zinc-800/60 rounded-xl" />
        <div className="h-4 w-64 bg-zinc-800/40 rounded-lg" />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-28 bg-zinc-800/40 rounded-2xl" />
        ))}
      </div>
      <div className="h-36 bg-zinc-800/40 rounded-2xl" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="h-80 bg-zinc-800/40 rounded-2xl" />
        <div className="h-80 bg-zinc-800/40 rounded-2xl" />
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
  }, [theme]);

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
    >
      {!initialized && loading && <DataLoadingSkeleton />}
      {!initialized && !loading && error && (
        <div className="min-h-[50vh] flex flex-col items-center justify-center gap-4">
          <p className="text-zinc-400 text-sm">{error}</p>
          <button
            onClick={() => void initialize()}
            className="px-4 py-2 rounded-xl bg-zinc-800 text-zinc-200 text-sm hover:bg-zinc-700 transition-colors"
          >
            Retry
          </button>
        </div>
      )}
      {initialized && (
        <>
      {activeTab === 'dashboard' && <Dashboard onNavigate={navigate} />}
      {activeTab === 'logs' && <Logs />}
      {activeTab === 'skills' && <Skills />}
      {activeTab === 'projects' && <Projects />}
      {activeTab === 'milestones' && <Milestones />}
        </>
      )}
    </Layout>
  );
}
