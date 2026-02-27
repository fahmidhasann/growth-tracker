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

export type Tab = 'dashboard' | 'logs' | 'skills' | 'projects' | 'milestones';
const VALID_TABS: Tab[] = ['dashboard', 'logs', 'skills', 'projects', 'milestones'];

function getTabFromHash(): Tab {
  const hash = window.location.hash.replace('#', '') as Tab;
  return VALID_TABS.includes(hash) ? hash : 'dashboard';
}

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>(getTabFromHash);

  const navigate = useCallback((tab: Tab) => {
    window.location.hash = tab;
    setActiveTab(tab);
  }, []);

  useEffect(() => {
    const onHashChange = () => setActiveTab(getTabFromHash());
    window.addEventListener('hashchange', onHashChange);
    // Set initial hash if missing
    if (!window.location.hash) window.location.hash = 'dashboard';
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  return (
    <Layout activeTab={activeTab} setActiveTab={navigate}>
      {activeTab === 'dashboard' && <Dashboard onNavigate={navigate} />}
      {activeTab === 'logs' && <Logs />}
      {activeTab === 'skills' && <Skills />}
      {activeTab === 'projects' && <Projects />}
      {activeTab === 'milestones' && <Milestones />}
    </Layout>
  );
}
