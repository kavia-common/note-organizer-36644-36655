import React, { useEffect, useMemo, useState } from 'react';
import './App.css';
import Header from './components/common/Header';
import Sidebar from './components/Layout/Sidebar';
import MainEditor from './components/Layout/MainEditor';
import EmptyState from './components/common/EmptyState';
import AuthGate from './components/auth/AuthGate';
import { useNotes } from './hooks/useNotes';
import { applyTheme } from './utils/theme';
import { featureFlags } from './utils/env';
import { checkConnectivity, getSupabaseEnvStatus } from './lib/supabaseClient';

// PUBLIC_INTERFACE
function App() {
  /** Ocean Notes App - single page layout with Supabase-backed notes */

  const [theme, setTheme] = useState('light');
  const [user, setUser] = useState(null);
  const flags = useMemo(() => featureFlags(), []);
  const authEnabled = flags.has('auth');

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const { notes, selectedId, selectedNote, setSelectedId, onCreate, onDelete, onEdit, search, setSearch, loading } =
    useNotes({ userId: authEnabled ? user?.id || null : null });

  const [online, setOnline] = useState(true);
  const [envMessage, setEnvMessage] = useState('');
  useEffect(() => {
    let mounted = true;
    (async () => {
      const status = getSupabaseEnvStatus();
      if (!mounted) return;
      if (!status.ready) {
        setEnvMessage(status.message || 'Supabase not configured.');
      }
      const res = await checkConnectivity();
      if (!mounted) return;
      setOnline(res.ok);
    })();
    return () => { mounted = false; };
  }, []);

  const onToggleTheme = () => setTheme((t) => (t === 'light' ? 'dark' : 'light'));

  const Main = (
    <div className="app">
      <Header online={online} message={envMessage} onToggleTheme={onToggleTheme} theme={theme} />
      <Sidebar
        notes={notes}
        selectedId={selectedId}
        onSelect={setSelectedId}
        onCreate={onCreate}
        onDelete={onDelete}
        search={search}
        onSearch={setSearch}
      />
      <main className="main">
        {selectedNote ? (
          <MainEditor note={selectedNote} onChange={onEdit} />
        ) : (
          <EmptyState onCreate={onCreate} />
        )}
        {loading && <div style={{ padding: 8, textAlign: 'center', color: '#6b7280' }}>Loading...</div>}
      </main>
    </div>
  );

  return (
    <AuthGate enabled={authEnabled} onUserChange={setUser}>
      {Main}
    </AuthGate>
  );
}

export default App;
