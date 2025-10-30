import { useCallback, useEffect, useMemo, useState } from 'react';
import { listNotes, createNote, updateNote, deleteNote as svcDelete } from '../services/notesService';
import { useDebouncedCallback } from './useDebouncedCallback';

/**
 * PUBLIC_INTERFACE
 */
export function useNotes({ userId = null } = {}) {
  /** Manage notes state: list, selection, editing, autosaving */
  const [notes, setNotes] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  const selectedNote = useMemo(
    () => notes.find(n => n.id === selectedId) || null,
    [notes, selectedId]
  );

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await listNotes({ userId, search });
      setNotes(data || []);
      if (data && data.length > 0 && !selectedId) {
        setSelectedId(data[0].id);
      }
    } finally {
      setLoading(false);
    }
  }, [userId, search, selectedId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const onCreate = useCallback(async () => {
    const { data } = await createNote({ title: 'Untitled', content: '', userId });
    if (data) {
      setNotes(prev => [data, ...prev]);
      setSelectedId(data.id);
    }
  }, [userId]);

  const onDelete = useCallback(async (id) => {
    await svcDelete(id);
    setNotes(prev => prev.filter(n => n.id !== id));
    setSelectedId((prev) => {
      if (prev === id) {
        return notes.find(n => n.id !== id)?.id || null;
      }
      return prev;
    });
  }, [notes]);

  const debouncedSave = useDebouncedCallback(async (id, updates) => {
    await updateNote(id, updates);
    setNotes(prev => prev.map(n => n.id === id ? { ...n, ...updates, updated_at: new Date().toISOString() } : n));
  }, 500);

  const onEdit = useCallback((updates) => {
    if (!selectedNote) return;
    // local optimistic update
    setNotes(prev => prev.map(n => n.id === selectedNote.id ? { ...n, ...updates } : n));
    debouncedSave(selectedNote.id, updates);
  }, [selectedNote, debouncedSave]);

  return {
    notes,
    selectedId,
    selectedNote,
    setSelectedId,
    onCreate,
    onDelete,
    onEdit,
    search,
    setSearch,
    loading,
    refresh,
  };
}
