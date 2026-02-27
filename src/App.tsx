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

export type Tab = 'dashboard' | 'logs' | 'skills' | 'projects' | 'milestones';
const VALID_TABS: Tab[] = ['dashboard', 'logs', 'skills', 'projects', 'milestones'];

function getTabFromHash(): Tab {
  const hash = window.location.hash.replace('#', '') as Tab;
  return VALID_TABS.includes(hash) ? hash : 'dashboard';
}

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>(getTabFromHash);
  const initialize = useStore((s) => s.initialize);
  const loading = useStore((s) => s.loading);
  const initialized = useStore((s) => s.initialized);
  const error = useStore((s) => s.error);

  const navigate = useCallback((tab: Tab) => {
    window.location.hash = tab;
    setActiveTab(tab);
  }, []);

  useEffect(() => {
    void initialize();
  }, [initialize]);

  useEffect(() => {
    const onHashChange = () => setActiveTab(getTabFromHash());
    window.addEventListener('hashchange', onHashChange);
    // Set initial hash if missing
    if (!window.location.hash) window.location.hash = 'dashboard';
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  return (
    <Layout activeTab={activeTab} setActiveTab={navigate}>
      {!initialized && loading && (
        <div className="min-h-[50vh] flex items-center justify-center text-zinc-400 text-sm">
          Loading your data...
        </div>
      )}
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
